const dom = {
    current_row: '.current',
    row: '.content__grid__row',
    current_boxes: '.current .content__grid__row__box',
    empty_boxes: '.current .empty',
    key: '.content__keyboard__key'
}

$(document).on('keyup', async function(e) {
    // on enter/current is full
    if (e.keyCode === 13 && !$(dom.empty_boxes).length) {
        const guess = $(dom.current_boxes).map(function() {
            return $(this).text()
        }).get().join('')
        const response = (await axios.get(`/api/score/${guess}`)).data
        console.log(response)

        // if word then score row and set next row if end score game
        if (response.isWord) {
            let full_score = 0
            response.result.forEach((obj, index) => {
                console.log(obj)
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

            if (full_score === $(dom.current_boxes).length * 2) {
                $(dom.current_row).removeClass('current')
            } else {
                // release and create new row
                $(dom.current_row).removeClass('current').next(dom.row).addClass('current')
            }
        } else {
            // shake to show incorrect
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
    else if (e.key.toUpperCase().match('^[\wA-Z]$')) {
        const first_box = $($(dom.empty_boxes)[0])
        first_box.toggleClass('empty').html(`<label>${e.key.toUpperCase()}</label>`)
    }
});