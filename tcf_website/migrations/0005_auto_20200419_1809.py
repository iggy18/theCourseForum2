# Generated by Django 3.0.5 on 2020-04-19 18:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tcf_website', '0004_auto_20200418_1614'),
    ]

    operations = [
        migrations.AddIndex(
            model_name='semester',
            index=models.Index(
                fields=[
                    'year',
                    'season'],
                name='tcf_website_year_caa60c_idx'),
        ),
        migrations.AddIndex(
            model_name='semester',
            index=models.Index(
                fields=['number'],
                name='tcf_website_number_f6373e_idx'),
        ),
    ]
