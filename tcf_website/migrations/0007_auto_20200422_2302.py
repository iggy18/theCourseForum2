# Generated by Django 3.0.5 on 2020-04-22 23:02

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tcf_website', '0006_auto_20200422_0610'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='instructoraverage',
            name='course',
        ),
        migrations.RemoveField(
            model_name='instructoraverage',
            name='instructor',
        ),
        migrations.DeleteModel(
            name='CourseAverage',
        ),
        migrations.DeleteModel(
            name='InstructorAverage',
        ),
    ]
