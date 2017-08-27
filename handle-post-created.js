let makeHandlePostCreated = ({ assignBadge }) => ({
  username,
  topicSlug,
  topicId,
  postNumber
}) => {
  if (topicSlug !== 'introduce-yourself')
    return Promise.resolve()

  let INTRODUCTION_BADGE_ID = 104
  let opts = {
    username,
    badgeId: INTRODUCTION_BADGE_ID,
    reason: `https://www.funfunforum.com/t/${topicId}/${postNumber}`
  }
  return assignBadge(opts)
}
module.exports = makeHandlePostCreated