# Generated by Django 3.0.7 on 2020-06-26 00:37

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('player', '0001_initial'),
        ('campaign', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='campaign',
            name='creator',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='campaigns', to='player.Player', verbose_name='creator'),
        ),
        migrations.CreateModel(
            name='PlayerCampaignMembership',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('can_manage', models.BooleanField(default=False, verbose_name='gm')),
                ('campaign', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='player_memberships', to='campaign.Campaign', verbose_name='campaign')),
                ('player', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='campaign_memberships', to='player.Player', verbose_name='player')),
            ],
        ),
        migrations.AddConstraint(
            model_name='playercampaignmembership',
            constraint=models.UniqueConstraint(fields=('campaign', 'player'), name='unique player and campaign'),
        ),
    ]
