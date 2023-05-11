// window show content
const showContent = () => {
    $('body').addClass('showContent');
}
// end window show content

// window handle event
$(window).on('load', function () {
    showContent();
})
// end window handle event