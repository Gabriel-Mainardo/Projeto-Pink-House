// Shared by the dashboard and public API. Records must be ordered newest first.
const STEP_POINTS = {
    phone: 0,
    email: 20,
    profile: 20,
    document: 20,
    photo: 20,
    video: 20,
    mediaComparison: 20,
};
const GESTURE_SELFIE_PREFIX = 'gesture-selfie::';
export function calculateReliabilityScore(verification) {
    if (!verification)
        return 0;
    let earnedPoints = 0;
    if (verification.phone_verified)
        earnedPoints += STEP_POINTS.phone;
    if (verification.email_verified)
        earnedPoints += STEP_POINTS.email;
    if (verification.profile_completed)
        earnedPoints += STEP_POINTS.profile;
    // Documento, fotos, vídeo e comparação contam assim que ENVIADOS (pending ou approved).
    // Itens "pending" aguardam revisão do admin mas o usuário já fez sua parte —
    // não faz sentido manter o score zerado enquanto espera aprovação.
    if (verification.document_verified || verification.document_status === 'pending')
        earnedPoints += STEP_POINTS.document;
    if (verification.photo_verified || verification.photo_status === 'pending')
        earnedPoints += STEP_POINTS.photo;
    if (verification.video_verified || verification.video_status === 'pending')
        earnedPoints += STEP_POINTS.video;
    if (verification.media_comparison_verified || verification.media_comparison_status === 'pending')
        earnedPoints += STEP_POINTS.mediaComparison;
    const totalPossiblePoints = Object.values(STEP_POINTS).reduce((sum, points) => sum + points, 0);
    if (totalPossiblePoints <= 0) {
        return 0;
    }
    return Math.min(Math.round((earnedPoints / totalPossiblePoints) * 100), 100);
}
function getRegularVerificationPhotos(photos) {
    if (!Array.isArray(photos))
        return [];
    return photos.filter((photo) => !photo.startsWith(GESTURE_SELFIE_PREFIX));
}
function getLatestMeaningfulValue(records, selector, predicate = (value) => value !== null && value !== undefined) {
    for (const record of records) {
        const value = selector(record);
        if (value !== null && value !== undefined && predicate(value)) {
            return value;
        }
    }
    return null;
}
function mergeVerificationStatus(records, options) {
    if (records.some(options.isApproved)) {
        return 'approved';
    }
    for (const record of records) {
        const status = options.getStatus(record);
        if (!status)
            continue;
        if (status === 'pending' && options.hasSubmission(record)) {
            return 'pending';
        }
        if (status === 'rejected' && options.hasSubmission(record)) {
            return 'rejected';
        }
    }
    return undefined;
}
export function mergeVerificationRecords(records) {
    if (records.length === 0) {
        return null;
    }
    const latest = records[0];
    const mergedPhotos = Array.from(new Set(records.flatMap((record) => record.verification_photos || [])));
    const merged = {
        ...latest,
        phone_verified: records.some((record) => Boolean(record.phone_verified)),
        phone_verified_at: getLatestMeaningfulValue(records, (record) => record.phone_verified_at) || undefined,
        phone_number: getLatestMeaningfulValue(records, (record) => record.phone_number, (value) => value.trim().length > 0) || undefined,
        email_verified: records.some((record) => Boolean(record.email_verified)),
        email_verified_at: getLatestMeaningfulValue(records, (record) => record.email_verified_at) || undefined,
        profile_completed: records.some((record) => Boolean(record.profile_completed)),
        profile_completed_at: getLatestMeaningfulValue(records, (record) => record.profile_completed_at) || undefined,
        document_verified: records.some((record) => Boolean(record.document_verified)),
        document_verified_at: getLatestMeaningfulValue(records, (record) => record.document_verified_at) || undefined,
        document_type: getLatestMeaningfulValue(records, (record) => record.document_type, (value) => value.trim().length > 0) || undefined,
        document_front_url: getLatestMeaningfulValue(records, (record) => record.document_front_url, (value) => value.trim().length > 0) || undefined,
        document_back_url: getLatestMeaningfulValue(records, (record) => record.document_back_url, (value) => value.trim().length > 0) || undefined,
        // photo_verified=true se o campo foi setado OU se photo_status='approved' (auto-aprovação).
        photo_verified: records.some((record) => Boolean(record.photo_verified) || record.photo_status === 'approved'),
        photo_verified_at: getLatestMeaningfulValue(records, (record) => record.photo_verified_at) || undefined,
        verification_photos: mergedPhotos,
        video_verified: records.some((record) => Boolean(record.video_verified)),
        video_verified_at: getLatestMeaningfulValue(records, (record) => record.video_verified_at) || undefined,
        verification_video_url: getLatestMeaningfulValue(records, (record) => record.verification_video_url, (value) => value.trim().length > 0) || undefined,
        media_comparison_verified: records.some((record) => Boolean(record.media_comparison_verified)),
        media_comparison_verified_at: getLatestMeaningfulValue(records, (record) => record.media_comparison_verified_at) || undefined,
        media_comparison_video_url: getLatestMeaningfulValue(records, (record) => record.media_comparison_video_url, (value) => value.trim().length > 0) || undefined,
        updated_at: getLatestMeaningfulValue(records, (record) => record.updated_at) || latest.updated_at,
        created_at: getLatestMeaningfulValue([...records].reverse(), (record) => record.created_at) || latest.created_at,
    };
    merged.document_status = mergeVerificationStatus(records, {
        getStatus: (record) => record.document_status,
        isApproved: (record) => Boolean(record.document_verified),
        hasSubmission: (record) => Boolean(record.document_front_url || record.document_back_url),
    });
    merged.photo_status = mergeVerificationStatus(records, {
        getStatus: (record) => record.photo_status,
        // Fotos são aprovadas imediatamente: aceita photo_verified=true OU photo_status='approved'.
        // Isso cobre o caso de RLS restritivo onde photo_verified não pôde ser escrito.
        isApproved: (record) => Boolean(record.photo_verified) || record.photo_status === 'approved',
        hasSubmission: (record) => getRegularVerificationPhotos(record.verification_photos).length > 0,
    });
    merged.video_status = mergeVerificationStatus(records, {
        getStatus: (record) => record.video_status,
        isApproved: (record) => Boolean(record.video_verified),
        hasSubmission: (record) => Boolean(record.verification_video_url),
    });
    merged.media_comparison_status = mergeVerificationStatus(records, {
        getStatus: (record) => record.media_comparison_status,
        isApproved: (record) => Boolean(record.media_comparison_verified),
        hasSubmission: (record) => Boolean(record.media_comparison_video_url),
    });
    merged.reliability_score = calculateReliabilityScore(merged);
    return merged;
}
