$(document).ready(function () {

$(".bwNeed").click(function (e) {
    e.preventDefault();
    $(".bwTheWall p").toggleClass("bwHide");
});
/*
$(window).scroll(function () { 
   if ($(window).scrollTop() >= $(document).height() - $(window).height() - 30) {
      //Add something at the end of the page
      alert("OMG! You at the bottom");
   }
});
*/
});