# Generated by Django 3.1.3 on 2020-11-04 17:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tempdoc', '0005_note'),
    ]

    operations = [
        migrations.AlterField(
            model_name='note',
            name='json',
            field=models.JSONField(blank=True, null=True, verbose_name='json'),
        ),
    ]
