window.addEventListener('load', sk);
function sk() {
    function sliderOninputListener(slider, label, measure_name) {
        let sliderValue = slider['value'];
        let costValue = label;
        costValue.value = sliderValue + ' '+label.getAttribute('measure');
        formula();
    }
    function inputOninputListener(input, slider) {
        let value = parseInt(input.value);
        if(value >=0 && value <= slider.max)
        {
            slider.value = value;
            input.value = value + ' ' + input.getAttribute('measure');
        }
        else
        {
            if(isNaN(value) || value <= 0)
            {
                slider.value = 0;
                input.value = 0 + ' ' + input.getAttribute('measure');;
            }
            else
            {
                slider.value = slider.max;
                input.value = slider.max + ' ' + input.getAttribute('measure');
            }
        }
        input.selectionStart = parseInt(input.value).toString().length;
        input.selectionEnd = parseInt(input.value).toString().length;
        formula();
    }
    //Применить ко всем input[type="text"] обработчик, который будет смещать
    //курсор внутри поля при нажатии на него, чтобы установить курсор на последней
    //цифре
    function inputOnactiveListener(event) {
        let input = event.currentTarget;
        let charIndex = 0;
        for (let i = input.value.length-1; i > 0 ; i--)
        {
            if(!isNumber(input.value[i]))
                charIndex = i;
        }
        input.selectionStart = charIndex;
        input.selectionEnd = charIndex;доход

    }
    function isNumber(number){
        return !isNaN(number) && isFinite(number) && number!=' ';
    }

    //Применить обработку полей ко всем .params-container
    let paramsContainers = document.body.querySelectorAll('.params-container');
    let inputTextElements = [];
    paramsContainers.forEach(paramsContainer => {
        let inputTextElement = paramsContainer.querySelector('input[type="text"]');
        let inputRangeElement = paramsContainer.querySelector('input[type="range"]');
        inputTextElements.push(inputTextElement);
        inputTextElement.addEventListener('input', inputOninputListener.bind(null, inputTextElement, inputRangeElement));
        inputTextElement.addEventListener('click', inputOnactiveListener);
        inputRangeElement.addEventListener('input', sliderOninputListener.bind(null, inputRangeElement, inputTextElement));

        //Установка значений подписей слайдера
        let min = inputRangeElement.min;
        let max = inputRangeElement.max;
        let sliderMarks = paramsContainer.querySelectorAll('.marks-container span');
        let step = parseInt((max - min)/(sliderMarks.length-1), 0);
        sliderMarks.forEach((mark, i)=>{
            mark.textContent = step * i + ' ' + inputTextElement.getAttribute('measure');
        });
        sliderMarks[sliderMarks.length-1].textContent = max+ ' ' + inputTextElement.getAttribute('measure');
        sliderMarks[0].textContent = min+ ' ' + inputTextElement.getAttribute('measure');
    });

    //Обработка результатов
    let resultFields = document.body.querySelectorAll('.results-container .result');
    let sumOfCredit = resultFields[0];
    let everyMonthPay = resultFields[1];
    let requiredRevenue = resultFields[2];
    let percentBet = resultFields[3];
    function formula() {
        sumOfCredit.textContent = (parseInt(inputTextElements[0].value) - parseInt(inputTextElements[1].value)) + ' $';
        everyMonthPay.textContent = Math.floor(parseInt(sumOfCredit.textContent) / parseInt(inputTextElements[2].value) /12) + ' $';
        requiredRevenue.textContent = Math.floor(parseInt(everyMonthPay.textContent)*1.1) + ' $';
        // percentBet.textContent = 0 + '$';

    }
}