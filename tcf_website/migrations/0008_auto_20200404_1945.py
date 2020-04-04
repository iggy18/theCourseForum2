# Generated by Django 3.0.5 on 2020-04-04 19:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tcf_website', '0007_auto_20200404_1937'),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name='vote',
            name='unique vote per user and review',
        ),
        migrations.AddConstraint(
            model_name='vote',
            constraint=models.UniqueConstraint(fields=('user', 'review'), name='unique vote per user and review'),
        ),
    ]