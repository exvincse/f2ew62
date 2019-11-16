// $(document).ready(function(){
//   $(window).on('load',function(){
//     let count = 0;
//     setInterval(() => {
//       $('.right__wrap__top__item a').eq(count).addClass('right__wrap__top__item--active').parent().siblings().find('a').removeClass('right__wrap__top__item--active');
//       count += 1;
//       if (count > $('.right__wrap__top__item a').length) count = 0;
//     }, 1000);
//   });
//   $('.content').click(function() {
//     $(this).addClass('left__contentab');
//     $('.left__content').addClass('left__contentabb');
//   })
//   $('.left__content__back').click(function() {
//     $('.content').removeClass('left__contentab');
//     $('.left__content').removeClass('left__contentabb');
//   })
//   $('.item__text__about').click(function () {
//     $('.item__click').slideToggle();
//   })
// })