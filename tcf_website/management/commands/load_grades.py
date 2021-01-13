from functools import reduce
from operator import or_
import os
import re

from django.core.exceptions import ObjectDoesNotExist
from django.core.management.base import BaseCommand
from django.db.models import Case, Count, F, FloatField, Q, Sum, Value, When
import pandas as pd
from tqdm import tqdm

from tcf_website.models import Course, CourseGrade, CourseInstructorGrade, Instructor


class Command(BaseCommand):
    """
    How To Use: Run python3 manage.py load_grades to load all grades
    in the tcf_website/management/commands/grade_data/csv/ directory.
    This should take ~20 min to run to load all the grades
    """
    help = 'Imports grade data from VAGrades CSV files into PostgresSQL database'

    course_grades = {}
    course_instructor_grades = {}

    def add_arguments(self, parser):
        # The only required argument at the moment
        # A previous author wrote that reloading all semesters can be dangerous
        # Not sure why, but requiring `ALL_DANGEROUS` to honor the help text
        parser.add_argument(
            'semester',
            help=('Semester to update grades (e.g. "2019_FALL").\nIf you wish'
                  ' to reload all semesters (potentially dangerous!) then put '
                  '"ALL_DANGEROUS" as the value of this argument.\nNote that '
                  'only a single semester is allowed.'),
            type=str
        )

    def handle(self, *args, **options):
        self.verbosity = options['verbosity']
        self.data_dir = 'tcf_website/management/commands/grade_data/csv/'
        if self.verbosity > 0:
            print('Step 1: Fetch Course and Instructor data for later use')
        self.courses = {
            (obj['subdepartment__mnemonic'], obj['number']): obj['id']
            for obj in Course.objects.values('id', 'number',
                                             'subdepartment__mnemonic')
        }
        self.instructors = {
            (obj['first_name'], obj['last_name'], obj['email']): obj['id']
            for obj in Instructor.objects.values('id', 'first_name',
                                                 'last_name', 'email')
        }
        # used for gpa calculation
        self.grades = [
            'a_plus', 'a', 'a_minus',
            'b_plus', 'b', 'b_minus',
            'c_plus', 'c', 'c_minus',
            'd_plus', 'd', 'd_minus',
            'f', 'ot', 'drop', 'withdraw',
        ]
        self.grade_weights = [4.0, 4.0, 3.7,
                              3.3, 3.0, 2.7,
                              2.3, 2.0, 1.7,
                              1.3, 1.0, 0.7,
                              0,
                              0, 0, 0]
        semester = options['semester']
        if semester == 'ALL_DANGEROUS':
            # Truncate existing tables
            CourseGrade.objects.all().delete()
            CourseInstructorGrade.objects.all().delete()
            # ignores temporary files ('~' on Windows, '.' otherwise)
            for file in sorted(os.listdir(self.data_dir)):
                if file[0] not in ('.', '~'):
                    self.load_semester_file(file)
            self.load_dict_into_models()
        else:
            self.load_semester_file(f"{semester.lower()}.csv")
            self.load_dict_into_models()
            self.consolidate_duplicate_instances()

    def clean(self, df):
        # Filter out data with no grades
        df = df.dropna(
            how="all",
            subset=['A+', 'A', 'A-',
                    'B+', 'B', 'B-',
                    'C+', 'C', 'C-',
                    'D+', 'D', 'D-',
                    'F']
        ).fillna(  # Impute NaNs with empty string if the field is a CharField
            {'Instructor Email': ''},
        )
        # Filter out data with missing instructor
        return df[df['Instructor Last Name'] != 'MISSING INSTRUCTOR']

    def load_semester_file(self, file):
        year, semester = file.split('.')[0].split('_')
        year = int(year)
        season = semester.upper()

        df = self.clean(pd.read_csv(os.path.join(self.data_dir, file)))
        if self.verbosity > 0:
            print(f"Found {df.size} sections in {file}")

        for index, row in tqdm(df.iterrows(), total=df.shape[0]):
            if self.verbosity == 3:
                print(str(row).encode('ascii', 'ignore').decode('ascii'))
            self.load_row_into_dict(row)
        if self.verbosity > 0:
            print(f'Done loading {file}')

    def load_row_into_dict(self, row):
        # parsing fields of the CSV file
        first_name = row['Instructor First Name']
        # row['Insructor Middle Name'] is not used
        last_name = row['Instructor Last Name']
        email = row['Instructor Email']
        subdepartment = row['Subject']
        # row['Section Number'] is not used
        title = row['Title']
        try:
            number = int(re.sub('[^0-9]', '', str(row['Course Number'])))
            gpa = float(row['Course GPA'])
            a_plus = int(row['A+'])
            a = int(row['A'])
            a_minus = int(row['A-'])
            b_plus = int(row['B+'])
            b = int(row['B'])
            b_minus = int(row['B-'])
            c_plus = int(row['C+'])
            c = int(row['C'])
            c_minus = int(row['C-'])
            d_plus = int(row['D+'])
            d = int(row['D'])
            d_minus = int(row['D-'])
            f = int(row['F'])
            ot = int(row['OT'])
            drop = int(row['DR'])
            withdraw = int(row['W'])
            total_enrolled = int(row['Total'])
        except (TypeError, ValueError) as e:
            if self.verbosity > 0:
                print(row)
                print(e)
            raise e
        # No error casting values to float/int, so continue
        # identifiers are tuple keys to dictionaries
        course_identifier = (subdepartment, number, title)
        course_instructor_identifier = (
            subdepartment, number, first_name, last_name, email)

        # value of dictionaries (incremented onto value if key already exists)
        this_semesters_grades = [a_plus, a, a_minus,
                                 b_plus, b, b_minus,
                                 c_plus, c, c_minus,
                                 d_plus, d, d_minus,
                                 f,
                                 ot, drop, withdraw]

        # load this semester into course dictionary
        if course_identifier in self.course_grades:
            for i in range(len(self.course_grades[course_identifier])):
                self.course_grades[course_identifier][i] += this_semesters_grades[i]
        else:
            self.course_grades[course_identifier] = this_semesters_grades

        # load this semester into course instructor dictionary
        if course_instructor_identifier in self.course_instructor_grades:
            for i in range(
                    len(self.course_instructor_grades[course_instructor_identifier])):
                self.course_instructor_grades[course_instructor_identifier][i] += this_semesters_grades[i]
        else:
            self.course_instructor_grades[course_instructor_identifier] = this_semesters_grades

    def load_dict_into_models(self):
        self.load_course_grade_dict_to_db()
        self.load_course_instructor_grade_dict_to_db()

    def load_course_grade_dict_to_db(self):
        if self.verbosity > 0:
            print('Step 2: Bulk-create CourseGrade instances')

        # load course grades
        unsaved_cg_instances = []
        for row in tqdm(self.course_grades):
            total_enrolled = sum(self.course_grades[row])
            total_weight = sum(a * b for a, b in
                               zip(self.course_grades[row], self.grade_weights))

            # calculate gpa excluding ot/drop/withdraw in total_enrolled
            total_enrolled_filtered = total_enrolled - \
                sum(self.course_grades[row][i] for i in (13, 14, 15))
            # check divide by 0
            if total_enrolled_filtered == 0:
                total_enrolled_gpa = 0
            else:
                total_enrolled_gpa = total_weight / total_enrolled_filtered

            course_grade_params = {
                'course_id': self.courses.get(row[:2]),
                'subdepartment': row[0],
                'number': row[1],
                'title': row[2],
                'average': total_enrolled_gpa,
                'a_plus': self.course_grades[row][0],
                'a': self.course_grades[row][1],
                'a_minus': self.course_grades[row][2],
                'b_plus': self.course_grades[row][3],
                'b': self.course_grades[row][4],
                'b_minus': self.course_grades[row][5],
                'c_plus': self.course_grades[row][6],
                'c': self.course_grades[row][7],
                'c_minus': self.course_grades[row][8],
                'd_plus': self.course_grades[row][9],
                'd': self.course_grades[row][10],
                'd_minus': self.course_grades[row][11],
                'f': self.course_grades[row][12],
                'ot': self.course_grades[row][13],
                'drop': self.course_grades[row][14],
                'withdraw': self.course_grades[row][15],
                'total_enrolled': total_enrolled
            }
            unsaved_cg_instance = CourseGrade(**course_grade_params)
            unsaved_cg_instances.append(unsaved_cg_instance)
        CourseGrade.objects.bulk_create(unsaved_cg_instances)
        if self.verbosity > 0:
            print('Done creating CourseGrade instances')

    def load_course_instructor_grade_dict_to_db(self):
        if self.verbosity > 0:
            print('Step 3: Bulk-create CourseInstructorGrade instances')
        # load course instructor grades
        unsaved_cig_instances = []
        for row in tqdm(self.course_instructor_grades):
            total_enrolled = 0
            for grade_count in self.course_instructor_grades[row]:
                total_enrolled += grade_count

            total_weight = 0
            for i in range(len(self.course_instructor_grades[row])):
                total_weight += (
                    self.course_instructor_grades[row][i] * self.grade_weights[i])

            # calculate gpa without including ot/drop/withdraw in
            # total_enrolled
            total_enrolled_filtered = total_enrolled - \
                sum(self.course_instructor_grades[row][i] for i in (13, 14, 15))
            if total_enrolled_filtered == 0:
                total_enrolled_gpa = 0
            else:
                total_enrolled_gpa = total_weight / total_enrolled_filtered

            course_instructor_grade_params = {
                'subdepartment': row[0],
                'number': row[1],
                'first_name': row[2],
                'middle_name': '',  # for backward compatibility
                'last_name': row[3],
                'email': row[4],
                'course_id': self.courses.get(row[:2]),
                'instructor_id': self.instructors.get(row[2:]),
                'average': total_enrolled_gpa,
                'a_plus': self.course_instructor_grades[row][0],
                'a': self.course_instructor_grades[row][1],
                'a_minus': self.course_instructor_grades[row][2],
                'b_plus': self.course_instructor_grades[row][3],
                'b': self.course_instructor_grades[row][4],
                'b_minus': self.course_instructor_grades[row][5],
                'c_plus': self.course_instructor_grades[row][6],
                'c': self.course_instructor_grades[row][7],
                'c_minus': self.course_instructor_grades[row][8],
                'd_plus': self.course_instructor_grades[row][9],
                'd': self.course_instructor_grades[row][10],
                'd_minus': self.course_instructor_grades[row][11],
                'f': self.course_instructor_grades[row][12],
                'ot': self.course_instructor_grades[row][13],
                'drop': self.course_instructor_grades[row][14],
                'withdraw': self.course_instructor_grades[row][15],
                'total_enrolled': total_enrolled
            }
            unsaved_cig_instance = CourseInstructorGrade(
                **course_instructor_grade_params)
            unsaved_cig_instances.append(unsaved_cig_instance)
        CourseInstructorGrade.objects.bulk_create(unsaved_cig_instances)
        if self.verbosity > 0:
            print('Done creating CourseInstructorGrade instances')

    def consolidate_duplicate_instances(self):
        self.consolidate_course_grade_instances()
        self.consolidate_course_instructor_grade_instances()

    def consolidate_course_grade_instances(self):
        fields_to_group_by = [
            'course_id', 'subdepartment', 'number', 'title',
        ]
        fields_to_sum = self.grades + ['total_enrolled']
        fields_to_compute = ['average']
        fields_all = fields_to_group_by + fields_to_sum + fields_to_compute

        combined = list(
            CourseGrade.objects
            .values(*fields_to_group_by)  # This is what combines each pair
            .annotate(
                **{field: Sum(field) for field in fields_to_sum},
                actual_enrolled=(F('total_enrolled') -
                                 F('ot') - F('drop') - F('withdraw')),
                average=Case(
                    When(
                        actual_enrolled__gt=0,
                        then=sum(
                            F(grade_name) * grade_weight
                            for grade_name, grade_weight
                            in zip(self.grades, self.grade_weights)
                        ) / F('actual_enrolled')
                    ),
                    default=Value('0'),
                    output_field=FloatField()
                )
            ).values(*fields_all)  # to exclude actual_enrolled
        )
        # Drop all CourseGrade instances
        num_deleted, _ = CourseGrade.objects.all().delete()
        if self.verbosity > 0:
            print(f'{num_deleted} instances deleted')
        # Create combined instances
        objects_created = CourseGrade.objects.bulk_create(
            [CourseGrade(**x) for x in combined])
        if self.verbosity > 0:
            print(f'{len(objects_created)} instances created')

        # Check the number of `MultipleObjectsReturned` errors
        assert CourseGrade.objects\
            .exclude(course=None)\
            .values('course', 'title')\
            .annotate(num=Count('id'))\
            .filter(num__gt=1).count() == 0, \
            'Multiple `CourseGrade`s for (course, title) pair?'

    def consolidate_course_instructor_grade_instances(self):
        fields_to_group_by = [
            'subdepartment', 'number', 'first_name', 'middle_name',
            'last_name', 'email', 'course_id', 'instructor_id',
        ]
        fields_to_sum = self.grades + ['total_enrolled']
        fields_to_compute = ['average']
        fields_all = fields_to_group_by + fields_to_sum + fields_to_compute

        combined = list(
            CourseInstructorGrade.objects
            .values(*fields_to_group_by)  # This is what combines each pair
            .annotate(
                **{field: Sum(field) for field in fields_to_sum},
                actual_enrolled=(F('total_enrolled') -
                                 F('ot') - F('drop') - F('withdraw')),
                average=Case(
                    When(
                        actual_enrolled__gt=0,
                        then=sum(
                            F(grade_name) * grade_weight
                            for grade_name, grade_weight
                            in zip(self.grades, self.grade_weights)
                        ) / F('actual_enrolled')
                    ),
                    default=Value('0'),
                    output_field=FloatField()
                )
            ).values(*fields_all)  # to exclude actual_enrolled
        )
        # Drop all CourseInstructorGrade instances
        num_deleted, _ = CourseInstructorGrade.objects.all().delete()
        if self.verbosity > 0:
            print(f'{num_deleted} instances deleted')
        # Create combined instances
        objects_created = CourseInstructorGrade.objects.bulk_create(
            [CourseInstructorGrade(**x) for x in combined])
        if self.verbosity > 0:
            print(f'{len(objects_created)} instances created')

        # Check the number of `MultipleObjectsReturned` errors
        assert CourseInstructorGrade.objects\
            .exclude(course=None)\
            .exclude(instructor=None)\
            .values('course', 'instructor')\
            .annotate(num=Count('id'))\
            .filter(num__gt=1).count() == 0, \
            'Multiple `CourseInstructorGrade`s for (course, instructor) pair?'

        assert CourseInstructorGrade.objects\
            .exclude(course=None)\
            .exclude(instructor=None)\
            .values('course', 'first_name', 'last_name')\
            .annotate(num=Count('id'))\
            .filter(num__gt=1).count() == 0, \
            'Multiple `CourseInstructorGrade`s for professors with same name'
