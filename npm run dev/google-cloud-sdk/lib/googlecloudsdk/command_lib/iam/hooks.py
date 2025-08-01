# -*- coding: utf-8 -*- #
# Copyright 2017 Google LLC. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""The python hooks for IAM surface."""

from __future__ import absolute_import
from __future__ import division
from __future__ import unicode_literals

from googlecloudsdk.api_lib.iam import util
from googlecloudsdk.api_lib.util import apis
from googlecloudsdk.calliope import arg_parsers
from googlecloudsdk.calliope import exceptions as gcloud_exceptions
from googlecloudsdk.command_lib.iam import iam_util
from googlecloudsdk.command_lib.util.apis import arg_utils
from googlecloudsdk.core import log


def UpdateRequestWithConditionFromFile(ref, args, request):
  """Python hook to add condition from --condition-from-file to request.

  Args:
    ref: A resource ref to the parsed resource.
    args: Parsed args namespace.
    request: The apitools request message to be modified.

  Returns:
    The modified apitools request message.
  """
  del ref
  if args.IsSpecified('condition_from_file'):
    _, messages = util.GetClientAndMessages()
    condition_message = messages.Expr(
        description=args.condition_from_file.get('description'),
        title=args.condition_from_file.get('title'),
        expression=args.condition_from_file.get('expression'),
    )
    request.condition = condition_message
  return request


def _ConditionFileFormatException(filename):
  return gcloud_exceptions.InvalidArgumentException(
      'condition-from-file',
      '{filename} must be a path to a YAML or JSON file containing the '
      'condition. `expression` and `title` are required keys. `description` is '
      'optional.'.format(filename=filename),
  )


def ParseConditionFromFile(condition_from_file):
  """Read condition from YAML or JSON file."""

  condition = arg_parsers.FileContents()(condition_from_file)
  condition_dict = iam_util.ParseYamlOrJsonCondition(
      condition, _ConditionFileFormatException(condition_from_file)
  )
  return condition_dict


def EnableIamAccountConfirmation(response, args):
  del response
  if args.command_path[len(args.command_path) - 3 :] == [
      'iam',
      'service-accounts',
      'enable',
  ]:
    log.status.Print(
        'Enabled service account [{}].'.format(args.service_account)
    )


def DisableIamAccountConfirmation(response, args):
  del response
  if args.command_path[len(args.command_path) - 3 :] == [
      'iam',
      'service-accounts',
      'disable',
  ]:
    log.status.Print(
        'Disabled service account [{}].'.format(args.service_account)
    )


def EnableIamKeyConfirmation(response, args):
  del response  # Unused.
  log.status.Print(
      'Enabled key [{0}] for service account [{1}].'.format(
          args.iam_key, args.iam_account
      )
  )


def DisableIamKeyConfirmation(response, args):
  del response  # Unused.
  log.status.Print(
      'Disabled key [{0}] for service account [{1}].'.format(
          args.iam_key, args.iam_account
      )
  )


def SetServiceAccountResource(ref, unused_args, request):
  """Add service account name to request name."""

  request.name = ref.RelativeName()
  return request


def ValidateUpdateFieldMask(ref, unused_args, request):
  """Validate the field mask for an update request."""

  del ref, unused_args  # Unused.
  # Confirm update has at least one path in fieldmask.
  if not request.patchServiceAccountRequest.updateMask:
    update_fields = ['--display-name', '--description']
    raise gcloud_exceptions.OneOfArgumentsRequiredException(
        update_fields, 'Specify at least one field to update.'
    )
  return request


def UseMaxRequestedPolicyVersion(api_field):
  """Set requestedPolicyVersion to max supported in GetIamPolicy request."""

  def Process(ref, args, request):
    del ref, args  # Unused.

    arg_utils.SetFieldInMessage(
        request, api_field, iam_util.MAX_LIBRARY_IAM_SUPPORTED_VERSION
    )
    return request

  return Process


def AddVersionToUpdateMaskIfNotPresent(update_mask_path):
  """Add ',version' to update_mask if it is not present."""

  def Process(ref, args, request):
    """The implementation of Process for the hook."""
    del ref, args  # Unused.

    update_mask = arg_utils.GetFieldValueFromMessage(request, update_mask_path)
    if 'version' not in update_mask:
      if update_mask is None:
        update_mask = 'version'
      else:
        update_mask += ',version'

    arg_utils.SetFieldInMessage(request, update_mask_path, update_mask)
    return request

  return Process


def CreateFullServiceAccountNameFromId(account_id):
  if not account_id.isdigit():
    raise gcloud_exceptions.InvalidArgumentException(
        'account_id',
        'Account unique ID should be a number. Please double check your input'
        ' and try again.',
    )
  return 'projects/-/serviceAccounts/' + account_id


def GeneratePublicKeyDataFromFile(path):
  """Generate public key data from a path.

  Args:
    path: (bytes) the public key file path given by the command.

  Raises:
    InvalidArgumentException: if the public key file path provided does not
                              exist or is too large.
  Returns:
    A public key encoded using the UTF-8 charset.
  """
  try:
    public_key_data = arg_parsers.FileContents()(path).strip()
  except arg_parsers.ArgumentTypeError as e:
    raise gcloud_exceptions.InvalidArgumentException(
        'public_key_file',
        '{}. Please double check your input and try again.'.format(e),
    )
  return public_key_data.encode('utf-8')


def AddCreateExtraAndExtendedAttributesConfigToRequest(ref, args, request):
  """Add ExtraAttributesOAuth2Client and ExtendedAttributesOAuth2Client fields to create workforcePoolProvider requests."""

  del ref
  messages = apis.GetMessagesModule('iam', 'v1')
  SetExtraAttributesOauth2ClientFields(request, args, messages)
  SetExtendedAttributesOauth2ClientFields(request, args, messages)
  return request


def AddClearableExtraAttributesConfigToRequest(ref, args, request):
  """Add ExtraAttributesOAuth2Client fields to update workforcePoolProvider requests."""
  del ref
  messages = apis.GetMessagesModule('iam', 'v1')
  if (
      args.clear_extra_attributes_config is not None
      and args.clear_extra_attributes_config
  ):
    arg_utils.SetFieldInMessage(
        request,
        'workforcePoolProvider.extraAttributesOauth2Client',
        None,
    )
  else:
    SetExtraAttributesOauth2ClientFields(request, args, messages)

  return request


def SetExtraAttributesOauth2ClientFields(request, args, messages):
  """Set ExtraAttributesOauth2Client fields in the request."""
  if args.extra_attributes_type is not None:
    response_type = (
        messages.GoogleIamAdminV1WorkforcePoolProviderExtraAttributesOAuth2Client.AttributesTypeValueValuesEnum
    )
    if 'azure-ad-groups-mail' in args.extra_attributes_type:
      arg_utils.SetFieldInMessage(
          request,
          'workforcePoolProvider.extraAttributesOauth2Client.attributesType',
          response_type.AZURE_AD_GROUPS_MAIL,
      )
    elif 'azure-ad-groups-id' in args.extra_attributes_type:
      arg_utils.SetFieldInMessage(
          request,
          'workforcePoolProvider.extraAttributesOauth2Client.attributesType',
          response_type.AZURE_AD_GROUPS_ID,
      )
    elif 'azure-ad-groups-display-name' in args.extra_attributes_type:
      arg_utils.SetFieldInMessage(
          request,
          'workforcePoolProvider.extraAttributesOauth2Client.attributesType',
          response_type.AZURE_AD_GROUPS_DISPLAY_NAME,
      )
  if args.extra_attributes_client_id is not None:
    arg_utils.SetFieldInMessage(
        request,
        'workforcePoolProvider.extraAttributesOauth2Client.clientId',
        args.extra_attributes_client_id,
    )
  if args.extra_attributes_client_secret_value is not None:
    arg_utils.SetFieldInMessage(
        request,
        'workforcePoolProvider.extraAttributesOauth2Client.clientSecret.value.plainText',
        args.extra_attributes_client_secret_value,
    )
  if args.extra_attributes_issuer_uri is not None:
    arg_utils.SetFieldInMessage(
        request,
        'workforcePoolProvider.extraAttributesOauth2Client.issuerUri',
        args.extra_attributes_issuer_uri,
    )
  if args.extra_attributes_filter is not None:
    arg_utils.SetFieldInMessage(
        request,
        'workforcePoolProvider.extraAttributesOauth2Client.queryParameters.filter',
        args.extra_attributes_filter,
    )


def SetExtendedAttributesOauth2ClientFields(request, args, messages):
  """Set ExtendedAttributesOauth2Client fields in the request."""
  if args.extended_attributes_type is not None:
    response_type = (
        messages.GoogleIamAdminV1WorkforcePoolProviderExtraAttributesOAuth2Client.AttributesTypeValueValuesEnum
    )
    if 'azure-ad-groups-id' in args.extended_attributes_type:
      arg_utils.SetFieldInMessage(
          request,
          'workforcePoolProvider.extendedAttributesOauth2Client.attributesType',
          response_type.AZURE_AD_GROUPS_ID,
      )
  if args.extended_attributes_client_id is not None:
    arg_utils.SetFieldInMessage(
        request,
        'workforcePoolProvider.extendedAttributesOauth2Client.clientId',
        args.extended_attributes_client_id,
    )
  if args.extended_attributes_client_secret_value is not None:
    arg_utils.SetFieldInMessage(
        request,
        'workforcePoolProvider.extendedAttributesOauth2Client.clientSecret.value.plainText',
        args.extended_attributes_client_secret_value,
    )
  if args.extended_attributes_issuer_uri is not None:
    arg_utils.SetFieldInMessage(
        request,
        'workforcePoolProvider.extendedAttributesOauth2Client.issuerUri',
        args.extended_attributes_issuer_uri,
    )
  if args.extended_attributes_filter is not None:
    arg_utils.SetFieldInMessage(
        request,
        'workforcePoolProvider.extendedAttributesOauth2Client.queryParameters.filter',
        args.extended_attributes_filter,
    )


def AddExtraAttributesConfigFieldMask(unused_ref, args, request):
  """Adds ExtraAttributesOauth2Client specific fieldmask entries to the update workforcePoolProvider request."""
  mask_fields = []
  if request.updateMask:
    mask_fields = request.updateMask.split(',')
  if (
      args.clear_extra_attributes_config is not None
      and args.clear_extra_attributes_config
  ):
    mask_fields.append('extraAttributesOauth2Client')
  if args.extra_attributes_type is not None:
    mask_fields.append('extraAttributesOauth2Client.attributesType')
  if args.extra_attributes_client_id is not None:
    mask_fields.append('extraAttributesOauth2Client.clientId')
  if args.extra_attributes_client_secret_value is not None:
    mask_fields.append(
        'extraAttributesOauth2Client.clientSecret.value.plainText'
    )
  if args.extra_attributes_issuer_uri is not None:
    mask_fields.append('extraAttributesOauth2Client.issuerUri')
  if args.extra_attributes_filter is not None:
    mask_fields.append('extraAttributesOauth2Client.queryParameters.filter')
  if mask_fields:
    request.updateMask = ','.join(mask_fields)
  return request


def ClearFlag(args):
  """Clear the value for a flag."""
  del args
  return None
