function handleVote(reviewID, isUpvote) {
    const voteCountElem = $(`#review${reviewID} .voteCount`);
    const voteCount = parseInt(voteCountElem.text());

    let elem;
    let otherElem;
    let endpoint;
    let newVoteCount;

    if (isUpvote) {
        elem = $(`#review${reviewID} .upvote`);
        otherElem = $(`#review${reviewID} .downvote`);
        endpoint = `/reviews/${reviewID}/upvote`;

        // If already upvoted, subtract 1.
        if (elem.hasClass("active")) {
            newVoteCount = voteCount - 1;
        // If already downvoted, add 2.
        } else if (otherElem.hasClass("active")) {
            newVoteCount = voteCount + 2;
        // Otherwise add 1.
        } else {
            newVoteCount = voteCount + 1;
        }
    } else {
        elem = $(`#review${reviewID} .downvote`);
        otherElem = $(`#review${reviewID} .upvote`);
        endpoint = `/reviews/${reviewID}/downvote`;

        // If already downvoted, add 1.
        if (elem.hasClass("active")) {
            newVoteCount = voteCount + 1;
        // If already upvoted, subtract 2.
        } else if (otherElem.hasClass("active")) {
            newVoteCount = voteCount - 2;
        // Otherwise subtract 1.
        } else {
            newVoteCount = voteCount - 1;
        }
    }

    // POST to upvote or downvote endpoint.
    fetch(endpoint, {
        method: "post",
        headers: { "X-CSRFToken": getCookie("csrftoken") }
    });

    // Update vote text.
    voteCountElem.text(newVoteCount);

    //
    if (elem.hasClass("active")) {
        elem.removeClass("active");
    } else {
        elem.addClass("active");
        otherElem.removeClass("active");
    }
}

export { handleVote };


$(function() {
    $('.review').each(function(i, review) {
      var reviewBlurb = $(this).find("div.review-text");
      var reviewText = $(this).find("p.review-text-all");
      var reviewCollapseLink = $(this).find("a.review-collapse-link");

      // Long review
      if (reviewBlurb.height() < reviewText.height()) {
        // Show "See More" expander only for long reviews
        reviewCollapseLink.show();
      }
      // Short review
      else {
        reviewCollapseLink.hide();
        reviewBlurb.css("height", "auto"); // Remove static blurb height
      }
    });
});
