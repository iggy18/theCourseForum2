const loadData = data => {
    /* eslint-disable camelcase */
    const { a_plus, a, a_minus, b_plus, b, b_minus, c_plus, c, c_minus, d_plus, d, d_minus, f, withdraw, drop } = data;
    const grades_data = [a_plus, a, a_minus, b_plus, b, b_minus, c_plus, c, c_minus, d_plus, d, d_minus, f, withdraw, drop];
    /* eslint-enable camelcase */

    createChart(grades_data);

    // these ternary-hack if statements are not favored by eslint
    // to keep this block of code concise, we'll just disable the warning
    /* eslint-disable no-unused-expressions */
    exist(data.average_gpa) ? document.getElementsByClassName("gpa-text")[0].innerHTML = data.average_gpa + " GPA" : null;

    exist(data.total_enrolled) ? document.getElementsByClassName("students-text")[0].innerHTML = data.total_enrolled + " Students" : document.getElementsByClassName("students-text")[0].remove();

    exist(data.average_rating) ? document.getElementsByClassName("rating-num")[0].innerHTML = data.average_rating : null;
    exist(data.average_hours_per_week) ? document.getElementsByClassName("hours-num")[0].innerHTML = data.average_hours_per_week : null;

    exist(data.average_instructor) ? document.getElementsByClassName("instructor-num")[0].innerHTML = data.average_instructor : null;
    exist(data.average_fun) ? document.getElementsByClassName("fun-num")[0].innerHTML = data.average_fun : null;
    exist(data.average_difficulty) ? document.getElementsByClassName("difficulty-num")[0].innerHTML = data.average_difficulty : null;
    exist(data.average_recommendability) ? document.getElementsByClassName("recommend-num")[0].innerHTML = data.average_recommendability : null;
    exist(data.average_amount_reading) ? document.getElementsByClassName("reading-num")[0].innerHTML = data.average_amount_reading : null;
    exist(data.average_amount_writing) ? document.getElementsByClassName("writing-num")[0].innerHTML = data.average_amount_writing : null;
    exist(data.average_amount_group) ? document.getElementsByClassName("group-num")[0].innerHTML = data.average_amount_group : null;
    exist(data.average_amount_homework) ? document.getElementsByClassName("homework-num")[0].innerHTML = data.average_amount_homework : null;

    exist(data.average_instructor) ? document.getElementsByClassName("instructor-bar")[0].style.width = 100 * (data.average_instructor - 0.8) / 4.2 + "%" : null;
    exist(data.average_fun) ? document.getElementsByClassName("fun-bar")[0].style.width = 100 * (data.average_fun - 0.8) / 4.2 + "%" : null;
    exist(data.average_difficulty) ? document.getElementsByClassName("difficulty-bar")[0].style.width = 100 * (data.average_difficulty - 0.8) / 4.2 + "%" : null;
    exist(data.average_recommendability) ? document.getElementsByClassName("recommend-bar")[0].style.width = 100 * (data.average_recommendability - 0.8) / 4.2 + "%" : null;
    exist(data.average_amount_reading) ? document.getElementsByClassName("reading-bar")[0].style.width = 100 * data.average_amount_reading / (data.average_hours_per_week) + "%" : null;
    exist(data.average_amount_writing) ? document.getElementsByClassName("writing-bar")[0].style.width = 100 * data.average_amount_writing / data.average_hours_per_week + "%" : null;
    exist(data.average_amount_group) ? document.getElementsByClassName("group-bar")[0].style.width = 100 * data.average_amount_group / data.average_hours_per_week + "%" : null;
    exist(data.average_amount_homework) ? document.getElementsByClassName("homework-bar")[0].style.width = 100 * data.average_amount_homework / data.average_hours_per_week + "%" : null;
    /* eslint-enable no-unused-expressions */
};

const createChart = gradesData => {
    const chartData = {
        datasets: [{
            data: gradesData,
            backgroundColor: [
                "#57679D",
                "#56669C",
                "#55659B",
                "#384676",
                "#384676",
                "#374575",
                "#364474",
                "#18244B",
                "#17234A",
                "#162249",
                "#E06A45",
                "#DE6843",
                "#C95F36",
                "#B45133",
                "#b35032"
            ]
        }],
        labels: [
            "A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F", "Withdraw", "Drop"
        ]
    };
    var ctx = document.getElementById("myChart");
    // 1. Justification for no-new: (Do not use 'new' for side effects)
    // Without disabling the warning, eslint complains about using `new` to produce side-effects.
    // (Which is how chart.js works. We can't change that.)
    // You can silence it by assigning the expression to a variable. But then, eslint complains that we have an unused variable.
    // We're not going to be able to avoid this, so I've disabled the error.
    // 2. Justification for no-undef: ('Chart' is not defined)
    // We could avoid this in the future by using WebPack or plain old ES6 modules.
    // But right now, the chart.js source is referenced in the templates themselves through a CDN,
    // so eslint will always complain. We'll just silence it.
    // eslint-disable-next-line no-new,no-undef
    new Chart(ctx, {
        type: "pie",
        data: chartData,
        options: {
            cutoutPercentage: 65,
            responsive: true,
            aspectRatio: 1,
            tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        var dataset = data.datasets[0];
                        var percent = Math.round((dataset.data[tooltipItem.index] / dataset._meta[0].total) * 100);
                        return data.labels[tooltipItem.index] + ": " + percent + "%";
                    }
                },
                displayColors: false
            },
            legend: {
                display: false
            },
            plugins: {
                labels: {
                    // render 'label', 'value', 'percentage', 'image' or custom function, default is 'percentage'
                    render: "label",

                    // font size, default is defaultFontSize
                    fontSize: 12,

                    // font color, can be color array for each data or function for dynamic color, default is defaultFontColor
                    fontColor: "#fff",

                    // font style, default is defaultFontStyle
                    fontStyle: "normal",

                    // draw label in arc, default is false
                    // bar chart ignores this
                    arc: false,

                    // position to draw label, available value is 'default', 'border' and 'outside'
                    // bar chart ignores this
                    // default is 'default'
                    position: "default",

                    // draw label even it's overlap, default is true
                    // bar chart ignores this
                    overlap: false,

                    // add margin of text when position is `outside` or `border`
                    // default is 2
                    textMargin: 4
                }
            }
        }
    });
};

const exist = data => {
    return data !== null && data !== undefined;
};
export { loadData };
