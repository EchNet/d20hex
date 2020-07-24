# Generated by Django 3.0.7 on 2020-07-16 16:03

import django.contrib.postgres.fields.jsonb
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('campaign', '0003_campaign_abs_seconds'),
    ]

    operations = [
        migrations.CreateModel(
            name='TempDoc',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('key', models.CharField(max_length=40, verbose_name='key')),
                ('data', django.contrib.postgres.fields.jsonb.JSONField(verbose_name='data')),
                ('campaign', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='documents', to='campaign.Campaign', verbose_name='campaign')),
            ],
        ),
    ]