
/* =========================
        Show Content
========================= */
const showContent = () => {
    $('body').addClass('showContent');
}

/* =========================
        Languages
========================= */
$('.titleLanguage').on('click', function () {
    $('body').removeClass('showMenu');
    $('body').toggleClass('showLanguage');
    $('.dropdownLanguage').slideToggle();

    if ($('.showMenu').length) {
        $('body').removeClass('wrapHidden showMenu');
    }
});

$('body, html').on('click', function (e) {
    var target = $(e.target);
    if (
        e.type == "focusin" ||
        target.closest(this.element).length ||
        target.closest(this.container).length ||
        target.closest('.wrapLanguage').length
    ) return;

    if ($('body').hasClass('showLanguage')) {
        $('body').removeClass('showLanguage');
        $('.dropdownLanguage').slideUp();
    }
});

/* =========================
        Btn Scroll Top
========================= */
function showBtnScrollTop() {
    if ($('.wrapBtnScrollTop').length) {
        var windowScrollTop = $(window).scrollTop();

        $("body").toggleClass("showScrollTop", windowScrollTop > 1)
    }
}

$(".wrapBtnScrollTop .linkItem").on('click', function (e) {
    $('body,html').animate({
        scrollTop: 0
    }, 100);

    e.preventDefault();
});

/* =========================
        Window Event
========================= */
$(window).on('load', function () {
    showContent();
})

