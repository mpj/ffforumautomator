let sinon = require('sinon')
var expect = require('expect.js');
expect = require('sinon-expect').enhance(expect, sinon, 'was');
let makeHandlePostCreated = require('./handle-post-created')

describe('handlePostCreated', () => {
  let handlePostCreated
  let bus
  beforeEach(() => {
    bus = {
      call: sinon.stub()
    }
    handlePostCreated = makeHandlePostCreated({
      bus
    })
  })

  it('can be called', () => {
    handlePostCreated({})
  })

  it('calls assign-badge with correct properties', () => {
    handlePostCreated({
      username: 'someusername',
      topicId: 555,
      postNumber: 66,
      topicSlug: 'introduce-yourself'
    })
    expect(bus.call).was.calledWith('assign-badge',{
      username: 'someusername',
      badgeId: 104,
      reason: `https://www.funfunforum.com/t/555/66`
    })
  })

  it('does NOT call assign-badge if not correct topic slug', () => {
    handlePostCreated({
      username: 'someusername',
      topicId: 555,
      postNumber: 66,
      topicSlug: 'some-other-topic-slug'
    })
    expect(bus.call).was.notCalled()
  })

  it('passes the promise from assign-badge on to the calling function', () => {
    let fakePromise = { iAm: 'FAKE PROMISE' }
    bus.call.returns(fakePromise)
    let output = handlePostCreated({
      username: 'someusername',
      topicId: 555,
      postNumber: 66,
      topicSlug: 'introduce-yourself'
    })
    expect(output).to.be(fakePromise)
  })

  it('returns a promise even when topic slug is not correct', (done) => {
    let output = handlePostCreated({
      username: 'someusername',
      topicId: 555,
      postNumber: 66,
      topicSlug: 'some-other-topic-slug'
    })
    output.then(() => { done() })
  })

})