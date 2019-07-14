'use strict'

let sliders = document.body.querySelectorAll('.slider');
let controls = [];
sliders.forEach((obj) => {
  let slideWidth = obj.getAttribute('data-slideWidth');
  let fullScreen = obj.getAttribute('data-fullScreen');
  let visibleSlidesCount = obj.getAttribute('data-visibleSlidesCount');
  let slider = new Slider({root: obj, slideWidth: slideWidth, fullScreen: fullScreen, visibleSlidesCount:visibleSlidesCount});
  controls.push(slider);
});

// fullScreen: true - ширина слайда на всю ширину экрана, slideWidth игнорируется
// slideWidth - ширина слайда в пикселях. Слайды автоматически добавляются, если вмещаются в размер экрана
// visibleSlidesCount - число слайдов на экране, если значение  установлено, все остальные параметры игнорируются кроме fullScreen

function Slider(options){
  if(!options) return;

  let self = this;
  let root = options.root;
  let content;
  let slides;
  let controlLeft;
  let controlRight;
  let slideWidth;
  let visibleSlidesCount;
  let spaceBetweenSlides;
  let canMove = true;
  let canwindowResizeRefresh = true;
  let maxSlidesCountOnViewport;

  let slidesOnViewport = [];
  let slidesBuffer = [];

  function init(){
    content = root.querySelector('.content');
    controlLeft = root.querySelector('.control-wrapper');
    controlRight = root.querySelector('.control-wrapper.control-wrapper-right');


    slideWidth = options.slideWidth;
    visibleSlidesCount = options.visibleSlidesCount;
    spaceBetweenSlides = 20;
  }

  function initSlides(){
    slides = content.querySelectorAll('img');
    let contentWidth = parseInt(getComputedStyle(content).width);

    slides = [].map.call(slides, (slide) => {return slide});
    if(visibleSlidesCount){
      slideWidth = contentWidth / options.visibleSlidesCount;
      maxSlidesCountOnViewport = visibleSlidesCount;
    }
    else{
      maxSlidesCountOnViewport = slides.length;
    }
    //Дублирование крайних элементов
    let first = slides.slice(0,slides.length-1);
    let last = slides.slice(slides.length-1, slides.length);
    slides = last.concat(slides);
    slides = slides.concat(first);
    //Конвертация img -> div с фоном
    if(slideWidth >= contentWidth)
      slideWidth = contentWidth;
    if(options.fullScreen && options.fullScreen == true)
      slideWidth = contentWidth;
    slides = slides.map((img, i) =>{
      let slide = document.createElement('div');
      slide.style.minWidth = slideWidth + "px";
      slide.style.backgroundImage = 'url('+img.src.substr((img.src).indexOf('/',10))+')';
      slide.classList.add('slide');
      if(content.contains(img))
        content.removeChild(img);
      slidesBuffer.push(slide);
      slide.style.transition = "all ease-in-out 1s";
      return slide;
    });
    slideWidth = +slideWidth;

    visibleSlidesCount = Math.trunc(contentWidth / slideWidth);
    if(visibleSlidesCount > maxSlidesCountOnViewport) visibleSlidesCount = maxSlidesCountOnViewport;
    let bufferElems = slidesBuffer.splice(0, visibleSlidesCount+2);
    slidesOnViewport = bufferElems;
    //Определение отступа между слайдами
    if(visibleSlidesCount>1)
      spaceBetweenSlides = (contentWidth - (slideWidth * visibleSlidesCount)) / (visibleSlidesCount-1);
    else{
      spaceBetweenSlides = (contentWidth - slideWidth)/2;
    }
    // spaceBetweenSlides = 0;
    slidesOnViewport.forEach((slide, i)=>{
      let pos = (i-1) * (slideWidth+spaceBetweenSlides) + (visibleSlidesCount>1?0:spaceBetweenSlides);
      slide.style.left = pos + "px";
      content.appendChild(slide);
    });
    //Поправка позиции, когда единовременно на экране 1 картинка
    if(visibleSlidesCount == 1){
      slidesOnViewport[0].style.left = (-(slideWidth)) + "px";
    }

  };

  function left() {
    if(!canMove) return;
    canMove = false;

    let contentWidth = parseInt(getComputedStyle(content).width);
    if(slidesBuffer.length!=0){
      slidesOnViewport.forEach(slide => {
        slide.style.left = (parseInt(slide.style.left) - slideWidth - spaceBetweenSlides ) + 'px';
      });

      let slide = slidesBuffer.shift();
      slide.style.left = ((slideWidth+spaceBetweenSlides)*(visibleSlidesCount) + (visibleSlidesCount>1?0:spaceBetweenSlides)) + "px";
      slide.style.transition = "all ease-in-out 1s";

      slidesOnViewport.push(slide);
      content.appendChild(slide);
      slidesOnViewport[0].addEventListener('transitionend', transitionendleft);
    }
    else
      canMove= true;
  }

  function transitionendleft(event) {
    event.target.removeEventListener('transitionend', transitionendleft);
    let removedSlide = slidesOnViewport.shift();
    slidesBuffer.push(removedSlide);
    content.removeChild(removedSlide);
    canMove = true;
  }

  function right() {
    if(!canMove) return;
    canMove = false;

    let contentWidth = parseInt(getComputedStyle(content).width);
    if(slidesBuffer.length!=0){
      slidesOnViewport.forEach(slide => {
        slide.style.left = (parseInt(slide.style.left) + slideWidth + spaceBetweenSlides ) + 'px';
      });

      let slide = slidesBuffer.pop();
      slide.style.left = (-(slideWidth + (visibleSlidesCount>1?spaceBetweenSlides:0))) + "px";
      // slide.style.left = ((slideWidth+spaceBetweenSlides)*(visibleSlidesCount) + (visibleSlidesCount>1?0:spaceBetweenSlides)) + "px";
      slide.style.transition = "all ease-in-out 1s";

      slidesOnViewport.unshift(slide);
      content.appendChild(slide);
      slidesOnViewport[slidesOnViewport.length-1].addEventListener('transitionend', transitionendright);
    }
    else
      canMove= true;
  }

  function transitionendright(event) {
    event.target.removeEventListener('transitionend', transitionendright);
    let removedSlide = slidesOnViewport.pop();
    slidesBuffer.unshift(removedSlide);
    content.removeChild(removedSlide);
    canMove = true;
  }

  function initEvents(){
    if(!options.slideWidth) return;
    let contentWidth = parseInt(getComputedStyle(content).width);

    window.addEventListener('resize', (event) => {

      let contentWidth = parseInt(getComputedStyle(content).width);
      let slidesCount =  Math.trunc(contentWidth / slideWidth);
      if(slidesCount > maxSlidesCountOnViewport) slidesCount = maxSlidesCountOnViewport;
      if(slideWidth >= contentWidth)
        slideWidth = contentWidth;
      if(options.fullScreen && options.fullScreen == true)
        slideWidth = contentWidth;

      let slidesCountDifference = slidesCount - visibleSlidesCount;
      if(slidesCount>1)
        spaceBetweenSlides = (contentWidth - (slideWidth * slidesCount)) / (slidesCount-1);
      else{
        spaceBetweenSlides = (contentWidth - slideWidth)/2;
      }
      if((!options.fullScreen || options.fullScreen == false) && slidesCount != visibleSlidesCount){
        canwindowResizeRefresh = false

        if(slidesCountDifference > 0){
          let removedSlides = slidesBuffer.splice(0, slidesCountDifference);
          slidesOnViewport = slidesOnViewport.concat(removedSlides);
          removedSlides.forEach((slide)=>{
            content.appendChild(slide);
          });
        }
        else if(slidesCountDifference < 0){
          slidesCountDifference = Math.abs(slidesCountDifference);
          let removedSlides = slidesOnViewport.splice(slidesOnViewport.length-slidesCountDifference, slidesOnViewport.length);
          slidesBuffer = removedSlides.concat(slidesBuffer);
          removedSlides.forEach((slide)=>{
            content.removeChild(slide);
          });
        }
        visibleSlidesCount = slidesCount;
      }
      slidesOnViewport.forEach((slide, i)=>{
        let pos = (i-1) * (slideWidth+spaceBetweenSlides) + (slidesCount>1?0:spaceBetweenSlides);
        slide.style.left = pos + "px";
        slide.style.minWidth = slideWidth + "px";
      });
      slidesBuffer.forEach((slide, i)=>{
        let pos = (i-1) * (slideWidth+spaceBetweenSlides) + (slidesCount>1?0:spaceBetweenSlides);
        slide.style.left = pos + "px";
        slide.style.minWidth = slideWidth + "px";
      });
    });

    controlLeft.onclick = function() {
      right();
    }
    controlRight.onclick = function() {
      left();
    }


    controlLeft.addEventListener('dragstart', mousedown);
    controlLeft.addEventListener('dragend', mouseup);
    controlRight.addEventListener('dragstart', mousedown);
    controlRight.addEventListener('dragend', mouseup);
    canwindowResizeRefresh = true;
  }

  let xStart;
  let xEnd;

  function mousedown(event) {
    xStart = event.clientX;
  }

  function mouseup(event){
    xEnd = event.clientX;
    if(xStart - xEnd > 0){
      left();
    }
    else if(xStart - xEnd < 0){
      right();
    }
  }

  init();
  initSlides();
  initEvents();
}
