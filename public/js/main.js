const dom = {
    row: '.current_word .content__grid__word__row',
    word: '.content__grid .content__grid__word',
    key: '.content__keyboard__key',
    current_word: '.current_word',
    current_row: '.current_row',
    current_boxes: '.current_row .content__grid__word__row__box',
    current_empty_boxes: '.current_row .empty'
}

$(document).on('keyup', async function(e) {
    // on enter/current is full
    if (e.keyCode === 13 && !$(dom.current_empty_boxes).length) {
        const guess = $(dom.current_boxes).map(function() {
            return $(this).text()
        }).get().join('')
        const response = (await axios.get(`/api/score/${guess}`)).data

        // if word then score row and set next row if end score game
        if (response.isWord) {
            let full_score = 0
            response.result.forEach((obj, index) => {
                const box = $($(dom.current_boxes)[index])
                const key = $(dom.key).find(`:contains('${obj.letter}')`).parent()

                if (obj.score === 2) {
                    box.addClass('correct').removeClass('close').removeClass('wrong')
                    key.addClass('correct').removeClass('close').removeClass('wrong')
                }
                else if (obj.score === 1) {
                    box.not('.correct').addClass('close').removeClass('wrong')
                    key.not('.correct').addClass('close').removeClass('wrong')
                } else {
                    box.not('.correct').not('.close').addClass('wrong')
                    key.not('.correct').not('.close').addClass('wrong')
                }

                full_score += obj.score
            })

            // if win for word (max score)
            if (full_score === $(dom.current_boxes).length * 2) {
                // has another word in phrase
                const next_word = $(dom.word).not('.current_word').first()
                if (next_word.length) {
                    // remove and add current word class
                    $(dom.current_word).removeClass('current_word')
                    next_word.addClass('current_word')

                    // remove and add current row class
                    $(dom.current_row).removeClass('current_row')
                    $(dom.row).first().addClass('current_row')
                } else {
                    // remove current row to stop game and mark success
                    $(dom.current_row).removeClass('current_row')
                    alert('success :)')
                }
            } else {
                // if next row exist, game is still playing
                if ($(dom.current_row).next(dom.row).length) {
                    // remove current row and add to next row
                    $(dom.current_row).removeClass('current_row').next(dom.row).addClass('current_row')
                } else {
                    alert('fail :(')
                }
            }
        } else {
            // shake word to indicate incorrect
            $(dom.current_row).effect('shake')
        }
    }
    // delete last current
    else if (e.keyCode === 8 || e.keyCode === 46) {
        const boxes = $(dom.current_boxes).not('.empty')
        const last_box = $($(boxes)[boxes.length-1])
        last_box.toggleClass('empty').html('')

    }
    // add letter to current row, first empty box if A-Z
    //else if (e.key.toUpperCase().match('^[\wA-Z]$')) {
    else if (e.key.length === 1) {
        const first_box = $($(dom.current_empty_boxes)[0])
        first_box.toggleClass('empty').html(`<label>${e.key.toUpperCase()}</label>`)
    }
});