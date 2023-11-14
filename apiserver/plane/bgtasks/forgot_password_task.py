# Django imports
from django.core.mail import EmailMultiAlternatives, get_connection
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings

# Third party imports
from celery import shared_task
from sentry_sdk import capture_exception

# Module imports
from plane.license.models import InstanceConfiguration
from plane.license.utils.instance_value import get_configuration_value

@shared_task
def forgot_password(first_name, email, uidb64, token, current_site):

    try:
        realtivelink = f"/accounts/reset-password/?uidb64={uidb64}&token={token}"
        abs_url = current_site + realtivelink

        from_email_string = settings.EMAIL_FROM

        subject = "Reset Your Password - Plane"

        context = {
            "first_name": first_name,
            "forgot_password_url": abs_url,
        }

        html_content = render_to_string("emails/auth/forgot_password.html", context)

        text_content = strip_tags(html_content)

        instance_configuration = InstanceConfiguration.objects.filter(key__startswith='EMAIL_').values("key", "value")
        connection = get_connection(
            host=get_configuration_value(instance_configuration, "EMAIL_HOST"),
            port=int(get_configuration_value(instance_configuration, "EMAIL_PORT", "587")),
            username=get_configuration_value(instance_configuration, "EMAIL_HOST_USER"),
            password=get_configuration_value(instance_configuration, "EMAIL_HOST_PASSWORD"),
            use_tls=bool(get_configuration_value(instance_configuration, "EMAIL_USE_TLS", "1")),
            use_ssl=bool(get_configuration_value(instance_configuration, "EMAIL_USE_SSL", "0")),
        )
        # Initiate email alternatives
        msg = EmailMultiAlternatives(subject=subject, text_content=text_content, from_email=settings.EMAIL_FROM, to=[email], connection=connection)
        msg.attach_alternative(html_content, "text/html")
        msg.send()
        return
    except Exception as e:
        # Print logs if in DEBUG mode
        if settings.DEBUG:
            print(e)
        capture_exception(e)
        return
