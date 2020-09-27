#pylint: disable=fixme
"""View pertaining to review creation/viewing."""

from django import forms
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render, redirect

from ..models import Review, Course, Semester, Instructor, Subdepartment

# TODO: use a proper django form, make it more robust.
# (i.e. better Course/Instructor/Semester search).


class ReviewForm(forms.Form):
    """Form for review creation."""
    departmentinput = forms.ChoiceField(choices=[(x, x) for x in Subdepartment.objects.all()])
    coursenumberinput = forms.ChoiceField(choices=[(x, x) for x in Subdepartment.objects.all()])
    instructornameinput = forms.ChoiceField(choices=[(x, x) for x in Subdepartment.objects.all()])
    #subdepartment.recent_courses

    semesterinput = forms.ChoiceField(choices=[("Fall","Fall"),("Winter","Winter"), ("Spring", "Spring"), ("Summer","Summer")]) 
    yearinput = forms.ChoiceField(choices=[(2020,2020),(2019,2019),(2018,2018),(2017,2017),(2016,2016),(2015,2015)])
    hoursinput = forms.IntegerField(min_value=0, max_value=40)
    hoursinput.widget.attrs['class'] = 'greyform form-small'
    writinginput = forms.BooleanField(widget=forms.CheckboxInput)
    writinginput.widget.attrs['id'] = 'checkbox_1'
    readinginput = forms.BooleanField(widget=forms.CheckboxInput)
    readinginput.widget.attrs['id'] = 'checkbox_2'
    groupworkinput = forms.BooleanField(widget=forms.CheckboxInput)
    groupworkinput.widget.attrs['id'] = 'checkbox_3'
    participationinput = forms.BooleanField(widget=forms.CheckboxInput)
    participationinput.widget.attrs['id'] = 'checkbox_4'
    assesmentsinput = forms.BooleanField(widget=forms.CheckboxInput)
    assesmentsinput.widget.attrs['id'] = 'checkbox_5'
    projectsinput = forms.BooleanField(widget=forms.CheckboxInput)
    projectsinput.widget.attrs['id'] = 'checkbox_6'
    difficultyinput = forms.IntegerField(widget=forms.NumberInput(attrs={'type':'range', 'step': '1', 'min': "1", 'max': "5", "class": 'custom-range', 'id': 'difficulty'}))
    instructorinput = forms.IntegerField(widget=forms.NumberInput(attrs={'type':'range', 'step': '1', 'min': "1", 'max': "5", "class": 'custom-range', 'id': 'instructorRating'}))
    recommendabilityinput = forms.IntegerField(widget=forms.NumberInput(attrs={'type':'range', 'step': '1', 'min': "1", 'max': "5", "class": 'custom-range', 'id': 'recommendability'}))
    commentsinput= forms.CharField(widget=forms.Textarea)
    commentsinput.widget.attrs['class'] = "greyform comments-form p-1"
    commentsinput.widget.attrs['name'] = "reviewText"
    commentsinput.widget.attrs['id'] = "reviewText"


@login_required
def upvote(request, review_id):
    """Upvote a view."""
    if request.method == 'POST':
        review = Review.objects.get(pk=review_id)
        review.upvote(request.user)
        return JsonResponse({'ok': True})
    return JsonResponse({'ok': False})


@login_required
def downvote(request, review_id):
    """Downvote a view."""
    if request.method == 'POST':
        review = Review.objects.get(pk=review_id)
        review.downvote(request.user)
        return JsonResponse({'ok': True})
    return JsonResponse({'ok': False})



@login_required
def new_review(request):
    """Review creation view."""

    # Collect form data into Review model instance.
    if request.method == 'POST':
        # TODO: use a proper django form.
        form = ReviewForm(request.POST)
        if form.is_valid():
            try:
                course_code = request.POST['course']
                mnemonic, number = course_code.split()
                course = Course.objects.get(
                    subdepartment__mnemonic=mnemonic, number=int(number))

                instructor_name = request.POST['instructor']
                first, last = instructor_name.split()
                instructor = Instructor.objects.get(
                    first_name=first, last_name=last)

                semester_str = request.POST['semester']
                season, year = semester_str.split()
                semester = Semester.objects.get(
                    season=season.upper(), year=int(year))

                Review.objects.create(
                    user=request.user,
                    course=course,
                    semester=semester,
                    instructor=instructor,
                    text=request.POST['reviewText'],
                    instructor_rating=int(
                        request.POST['instructorRating']),
                    difficulty=int(request.POST['difficulty']),
                    recommendability=int(
                        request.POST['recommendability']),
                    hours_per_week=int(request.POST['hours']),
                )

                return redirect('reviews')
            except KeyError as err:
                print(err)
                print(request.POST)
                return render(request, 'reviews/new.html', {'form': form})
        else:
            print("error")
            print(form)
            return render(request, 'reviews/new.html', {'form': form})

    form = ReviewForm()
    return render(request, 'reviews/new.html', {'form': form})
    