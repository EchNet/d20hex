# Generated by Django 3.0.7 on 2020-07-26 21:32

import django.contrib.postgres.fields.jsonb
from django.db import migrations, models
import django.db.models.deletion
import django_extensions.db.fields


class Migration(migrations.Migration):

    dependencies = [
        ('campaign', '0003_campaign_abs_seconds'),
        ('tempdoc', '0004_auto_20200724_2220'),
    ]

    operations = [
        migrations.CreateModel(
            name='Note',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('topic', models.CharField(db_index=True, max_length=96, verbose_name='topic')),
                ('json', django.contrib.postgres.fields.jsonb.JSONField(blank=True, null=True, verbose_name='json')),
                ('text', models.TextField(blank=True, null=True, verbose_name='text')),
                ('created_on', django_extensions.db.fields.CreationDateTimeField(auto_now_add=True, db_index=True, verbose_name='created_on')),
                ('campaign', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notes', to='campaign.Campaign', verbose_name='campaign')),
            ],
        ),
    ]
