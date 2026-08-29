'use server';

import { requireOwnerSession } from '@/lib/auth';
import { actionOk, fromError, type ActionResult } from '@/lib/action-result';
import { PublishingService } from '@/services/publishing.service';
import {
  SubmitForReviewSchema,
  ReturnToDraftSchema,
  SchedulePublicationSchema,
  PublishNowSchema,
  UnpublishSchema,
  ArchivePublicationSchema,
  RestorePublicationSchema,
  ChangeVisibilitySchema,
  PublishingListFilterSchema,
  PublishableEntityTypeEnum,
  VisibilityEnum,
  PublicationStatusEnum,
  type SubmitForReviewInput,
  type ReturnToDraftInput,
  type SchedulePublicationInput,
  type PublishNowInput,
  type UnpublishInput,
  type ArchivePublicationInput,
  type RestorePublicationInput,
  type ChangeVisibilityInput,
  type PublishingListFilterInput,
} from '@/validations/publishing';
import type {
  PublicationReadinessDTO,
  PublicImpactPreviewDTO,
  PublicationStateDTO,
  PublishingListItemDTO,
  PublishingOverviewDTO,
} from '@/types/dtos/publishing.dto';

export async function getPublicationReadinessAction(
  entityType: string,
  entityId: string
): Promise<ActionResult<PublicationReadinessDTO>> {
  try {
    const session = await requireOwnerSession();
    const validatedType = PublishableEntityTypeEnum.parse(entityType);
    const readiness = await PublishingService.getPublicationReadiness(
      session.userId,
      validatedType,
      entityId
    );
    return actionOk(readiness);
  } catch (error) {
    return fromError(error);
  }
}

export async function getPublicImpactPreviewAction(
  entityType: string,
  entityId: string,
  targetVisibility?: string,
  targetStatus?: string
): Promise<ActionResult<PublicImpactPreviewDTO>> {
  try {
    const session = await requireOwnerSession();
    const validatedType = PublishableEntityTypeEnum.parse(entityType);
    const vis = targetVisibility ? VisibilityEnum.parse(targetVisibility) : undefined;
    const stat = targetStatus ? PublicationStatusEnum.parse(targetStatus) : undefined;

    const preview = await PublishingService.getPublicImpactPreview(
      session.userId,
      validatedType,
      entityId,
      vis,
      stat
    );
    return actionOk(preview);
  } catch (error) {
    return fromError(error);
  }
}

export async function submitForReviewAction(
  input: SubmitForReviewInput
): Promise<ActionResult<PublicationStateDTO>> {
  try {
    const session = await requireOwnerSession();
    const validated = SubmitForReviewSchema.parse(input);
    const state = await PublishingService.submitForReview(
      session.userId,
      validated.entityType,
      validated.entityId,
      session.userId
    );
    return actionOk(state);
  } catch (error) {
    return fromError(error);
  }
}

export async function returnToDraftAction(
  input: ReturnToDraftInput
): Promise<ActionResult<PublicationStateDTO>> {
  try {
    const session = await requireOwnerSession();
    const validated = ReturnToDraftSchema.parse(input);
    const state = await PublishingService.returnToDraft(
      session.userId,
      validated.entityType,
      validated.entityId,
      session.userId
    );
    return actionOk(state);
  } catch (error) {
    return fromError(error);
  }
}

export async function schedulePublicationAction(
  input: SchedulePublicationInput
): Promise<ActionResult<PublicationStateDTO>> {
  try {
    const session = await requireOwnerSession();
    const validated = SchedulePublicationSchema.parse(input);
    const state = await PublishingService.schedulePublication(
      session.userId,
      validated.entityType,
      validated.entityId,
      new Date(validated.scheduledAt),
      session.userId
    );
    return actionOk(state);
  } catch (error) {
    return fromError(error);
  }
}

export async function publishNowAction(
  input: PublishNowInput
): Promise<ActionResult<PublicationStateDTO>> {
  try {
    const session = await requireOwnerSession();
    const validated = PublishNowSchema.parse(input);
    const state = await PublishingService.publishNow(
      session.userId,
      validated.entityType,
      validated.entityId,
      session.userId
    );
    return actionOk(state);
  } catch (error) {
    return fromError(error);
  }
}

export async function unpublishAction(
  input: UnpublishInput
): Promise<ActionResult<PublicationStateDTO>> {
  try {
    const session = await requireOwnerSession();
    const validated = UnpublishSchema.parse(input);
    const state = await PublishingService.unpublish(
      session.userId,
      validated.entityType,
      validated.entityId,
      session.userId
    );
    return actionOk(state);
  } catch (error) {
    return fromError(error);
  }
}

export async function archivePublicationAction(
  input: ArchivePublicationInput
): Promise<ActionResult<PublicationStateDTO>> {
  try {
    const session = await requireOwnerSession();
    const validated = ArchivePublicationSchema.parse(input);
    const state = await PublishingService.archivePublication(
      session.userId,
      validated.entityType,
      validated.entityId,
      session.userId
    );
    return actionOk(state);
  } catch (error) {
    return fromError(error);
  }
}

export async function restorePublicationAction(
  input: RestorePublicationInput
): Promise<ActionResult<PublicationStateDTO>> {
  try {
    const session = await requireOwnerSession();
    const validated = RestorePublicationSchema.parse(input);
    const state = await PublishingService.restoreToDraft(
      session.userId,
      validated.entityType,
      validated.entityId,
      session.userId
    );
    return actionOk(state);
  } catch (error) {
    return fromError(error);
  }
}

export async function changeVisibilityAction(
  input: ChangeVisibilityInput
): Promise<ActionResult<PublicationStateDTO>> {
  try {
    const session = await requireOwnerSession();
    const validated = ChangeVisibilitySchema.parse(input);
    const state = await PublishingService.changeVisibility(
      session.userId,
      validated.entityType,
      validated.entityId,
      validated.visibility,
      session.userId
    );
    return actionOk(state);
  } catch (error) {
    return fromError(error);
  }
}

export async function listPublishingItemsAction(
  input?: Partial<PublishingListFilterInput>
): Promise<ActionResult<PublishingListItemDTO[]>> {
  try {
    const session = await requireOwnerSession();
    const validated = PublishingListFilterSchema.parse(input || {});
    const items = await PublishingService.listPublishingItems(session.userId, validated);
    return actionOk(items);
  } catch (error) {
    return fromError(error);
  }
}

export async function getPublishingOverviewAction(): Promise<ActionResult<PublishingOverviewDTO>> {
  try {
    const session = await requireOwnerSession();
    const overview = await PublishingService.getPublishingOverview(session.userId);
    return actionOk(overview);
  } catch (error) {
    return fromError(error);
  }
}
