let makeHandlePostCreated = ({ assignBadge }) => ({
  username,
  topicSlug,
  topicId,
  postNumber
}) => {
  if (topicSlug !== 'introduce-yourself')
    return Promise.resolve()

  let INTRODUCTION_BADGE_ID = 104
  return assignBadge({
    username,
    badgeId: INTRODUCTION_BADGE_ID,
    reason: `https://www.funfunforum.com/t/${topicId}/${postNumber}`
  })
}
module.exports = makeHandlePostCreated