# -*- coding: utf-8 -*- #
# Copyright 2020 Google LLC. All Rights Reserved.
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

"""`gcloud api-gateway operations cancel` command."""

from __future__ import absolute_import
from __future__ import division
from __future__ import unicode_literals

from googlecloudsdk.api_lib.api_gateway import operations
from googlecloudsdk.calliope import base
from googlecloudsdk.command_lib.api_gateway import operations_util
from googlecloudsdk.command_lib.api_gateway import resource_args
from googlecloudsdk.core.console import console_io


@base.ReleaseTracks(base.ReleaseTrack.ALPHA, base.ReleaseTrack.BETA,
                    base.ReleaseTrack.GA)
@base.DefaultUniverseOnly
class Cancel(base.Command):
  """Cancel a Cloud API Gateway operation."""

  detailed_help = {
      'DESCRIPTION':
          '{description}',
      'EXAMPLES':
          """\
          To cancel a Cloud API Gateway operation named ``NAME'' in the ``us-central1''
          region, run:

            $ {command} NAME --location=us-central1

          To cancel a Cloud API Gateway operation with a resource name of ``RESOURCE'',
          run:

            $ {command} RESOURCE

          """
  }

  @staticmethod
  def Args(parser):
    resource_args.AddOperationResourceArgs(parser, 'cancel')

  def Run(self, args):
    client = operations.OperationsClient()
    operation_ref = args.CONCEPTS.operation.Parse()

    console_io.PromptContinue(
        message='The operation [{}] will be cancelled.'.format(
            operation_ref.RelativeName()),
        throw_if_unattended=True,
        cancel_on_no=True)

    client.Cancel(operation_ref)

    operations_util.PrintOperationResultWithWaitEpilogue(
        operation_ref,
        'Operation cancellation requested')
