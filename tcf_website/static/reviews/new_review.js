/*
 * Cascading dropdown data population for the "new review" form
 * in review.py and reviews/new_review.html
 * Author: j-alicia-long, 11/22/2020
*/

// Executed when DOM is ready
jQuery(function ($) {
    // Clear & disable sequenced dropdowns
    clearDropdown("#subject");
    clearDropdown("#course");
    clearDropdown("#instructor");
    clearDropdown("#semester");
    // Enable subject selector, disable the following
    $("#subject").prop("disabled", false);
    $("#course").prop("disabled", true);
    $("#instructor").prop("disabled", true);
    $("#semester").prop("disabled", true);

    fillSubjects($);

    // Fetch course data on subject select
    $("#subject").change(function () {
        // Clear & disable sequenced dropdowns
        clearDropdown("#course");
        clearDropdown("#instructor");
        clearDropdown("#semester");
        // Enable course selector, disable the following
        $("#course").prop("disabled", false);
        $("#instructor").prop("disabled", true);
        $("#semester").prop("disabled", true);

        fillCourses($);
    });

    // Fetch instructor data on course select
    $("#course").change(function () {
        // Clear & disable sequenced dropdowns
        clearDropdown("#instructor");
        clearDropdown("#semester");
        // Enable instructor selector, disable the following
        $("#instructor").prop("disabled", false);
        $("#semester").prop("disabled", true);

        fillInstructors($);
    });

    // Fetch semester data on instructor select
    $("#instructor").change(function () {
        // Clear & disable sequenced dropdowns
        clearDropdown("#semester");
        // Enable semester selector, disable the following
        $("#semester").prop("disabled", false);

        fillSemesters($);
    });

    /* Course Rating Slider Inputs */
    // Instructor Rating
    $("#instructorRating2").val($("#instructorRating").val());
    $("#instructorRating").change(function () {
        $("#instructorRating2").val($("#instructorRating").val());
    });
    $("#instructorRating2").change(function () {
        $("#instructorRating").val($("#instructorRating2").val());
    });

    // Enjoyability
    $("#enjoyability2").val($("#enjoyability").val());
    $("#enjoyability").change(function () {
        $("#enjoyability2").val($("#enjoyability").val());
    });
    $("#enjoyability2").change(function () {
        $("#enjoyability").val($("#enjoyability2").val());
    });

    // Difficulty
    $("#difficulty2").val($("#difficulty").val());
    $("#difficulty").change(function () {
        $("#difficulty2").val($("#difficulty").val());
    });
    $("#difficulty2").change(function () {
        $("#difficulty").val($("#difficulty2").val());
    });

    // Recommendability
    $("#recommendability2").val($("#recommendability").val());
    $("#recommendability").change(function () {
        $("#recommendability2").val($("#recommendability").val());
    });
    $("#recommendability2").change(function () {
        $("#recommendability").val($("#recommendability2").val());
    });

    console.log("hi!")
    // setTimeout(() => {
    //     console.log("World!");
    //
    //     setSemester(setInstructor(setCourse(setSubject())))
    // }, 1);
    //


    data = {
        "subject": "43",
        "course": "748",
        "instructor": "691",
        "sem": "40"
    }

    // console.log($("#subject").val())
    // setSubject(setCourse(setInstructor(setSemester())))
    // setSemester(setInstructor(setCourse(setSubject())))

    // console.log($("#subject").val())

    console.log("hi!!!")

    function setSubject() {
        setTimeout(() => {
            console.log("setting subject", data.subject)
            // $("#subject").val(data.subject).change()
            setDropdown("#subject", subj)
            console.log($("#subject").val())
            if (typeof callback === 'function') {
                callback(data)
            }
        }, 2000 / 2 / 2 / 3)
    }

    function setCourse(callback) {
        setTimeout(() => {
            console.log("setting course", data.course)
            setDropdown("#course", course);
            if (typeof callback === 'function') {
                callback(data)
            }
        }, 4000 / 2 / 2 / 3)
    }

    function setInstructor(callback) {
        setTimeout(() => {
            console.log("setting ins", data.instructor)
            setDropdown("#instructor", ins);
            if (typeof callback === 'function') {
                callback(data)
            }
        }, 6000 / 2 / 2 / 3)

    }

    function setSemester(callback) {
        setTimeout(() => {
            console.log("setting sem", data.semester)
            setDropdown("#semester", sem);
        }, 8000 / 2 / 2 / 3)
    }

    // choice = {
    //     'val': '43',
    //     'text': 'ECON | Economics'
    // }
    // setFixedDropdown("#subject", choice)
    // // fillSubjects($)
    // // fillCourses($)
    // choice2 = {
    //     'val': '750',
    //     'text': '2060 | American Economic History'
    // }
    // setFixedDropdown("#course", choice2)
    // fillInstructors($)
    // fillInstructors($)

    // new Promise((resolve, reject) => {
    //     setDropdown("#subject", subj);
    //     fillCourses()
    //     resolve()
    // }).then(() => {
    //     console.log("stafsdsf")
    //     setDropdown("#course", course);
    //     fillInstructors()
    // }).then(() => {
    //     setDropdown("#instructor", ins);
    //     fillSemesters()
    // }).then(() => {
    //     setDropdown("#semester", sem);
    // })

    // new Promise((resolve, reject) => {
    //     console.log('Initial');
    //
    //     resolve();
    // })
    //     .then(() => {
    //         throw new Error('Something failed');
    //
    //         console.log('Do this');
    //     })
    //     .catch(() => {
    //         console.error('Do that');
    //     })
    //     .then(() => {
    //         console.log('Do this, no matter what happened before');
    //     });
    autofill()
});

async function autofill() {
    console.log("hi!")
    var subj = "43"
    var course = "748"
    var ins = "691"
    var sem = "40"

    await fillSubjects($)
    await setDropdown("#subject", subj);
    await fillCourses($)
    console.log("should happen after")
    await setDropdown("#course", course);
    await fillInstructors($)
    await setDropdown("#instructor", ins);
    await fillSemesters($)
    await setDropdown("#semester", sem);
}

// Clears all dropdown options & adds a disabled default option
function clearDropdown(id) {
    $(id).empty();
    $(id).html("<option value='' disabled selected>Select...</option>");
}

// Sets to
function setDropdown(id, choice) {
    return new Promise(resolve => {
        console.log(id, choice)
        $(id).val(choice).trigger('change');
        // $(id).change();

        console.log(id, "set to", $(id).val())
        resolve("set")
    })
}

function setFixedDropdown(id, choice) {
    console.log(id, choice, choice.val)

    $(id).empty();
    $(id).html(`<option value=${choice.val}>${choice.text}</option>`);

    console.log($(id).val())
}

function fillSubjects($) {
    return new Promise(resolve => {
        // Fetch all subdepartment data from API
        var subdeptEndpoint = "/api/subdepartments/";
        $.getJSON(subdeptEndpoint, function (data) {
            // Sort departments alphabetically by mnemonic
            data.sort(function (a, b) {
                return a.mnemonic.localeCompare(b.mnemonic);
            });

            // Generate option tags
            $.each(data, function (i, subdept) {
                $("<option />", {
                    val: subdept.id,
                    text: subdept.mnemonic + " | " + subdept.name
                }).appendTo("#subject");
            });
            return this;
        });
        resolve("subjects filled")
    })
}

function fillCourses($) {
    return new Promise(resolve => {
        // Fetch course data from API, based on selected subdepartment
        var subdeptID = $("#subject").val();
        console.log("subdept is",subdeptID)
        var pageSize = "1000";
        var courseEndpoint = `/api/courses/?subdepartment=${subdeptID}
                              &page_size=${pageSize}&recent`;
        $.getJSON(courseEndpoint, function (data) {
            // Generate option tags
            $.each(data.results, function (i, course) {
                $("<option />", {
                    val: course.id,
                    text: course.number + " | " + course.title
                }).appendTo("#course");
            });
            return this;
        });
        console.log("should happen before")
        resolve("courses filled")
    });
}

function fillInstructors($) {
    return new Promise(resolve => {
        // Fetch instructor data from API, based on selected course
        var course = $("#course").val();
        var pageSize = "1000";
        var instrEndpoint = `/api/instructors/?course=${course}` +
            `&page_size=${pageSize}`;
        $.getJSON(instrEndpoint, function (data) {
            clearDropdown("#instructor"); // Empty dropdown

            // Generate option tags
            $.each(data.results, function (i, instr) {
                $("<option />", {
                    val: instr.id,
                    text: instr.first_name + " " + instr.last_name
                }).appendTo("#instructor");
            });
            return this;
        });
        resolve("instructors filled")
    });
}

function fillSemesters($) {
    return new Promise(resolve => {
        // Fetch all semester data from API
        var course = $("#course").val();
        var instrID = $("#instructor").val();
        var semEndpoint = `/api/semesters/?course=${course}&instructor=${instrID}`;
        $.getJSON(semEndpoint, function (data) {
            // Generate option tags
            $.each(data, function (i, semester) {
                // Note: API returns semester list in reverse chronological order,
                // Most recent 5 years only
                $("<option />", {
                    val: semester.id,
                    text: semester.season + " " + semester.year
                }).appendTo("#semester");
            });
            return this;
        });
        resolve("semesters filled")
    });
}