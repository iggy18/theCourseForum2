/*
 * Cascading dropdown data population for the "new review" form
 * in review.py and reviews/new_review.html
 * Author: j-alicia-long, 11/22/2020
*/

// Executed when DOM is ready
jQuery(function ($) {
    console.log(preload_data)
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

    let trigger_preload = false
    if (!jQuery.isEmptyObject(preload_data)){
        console.log("preloading", preload_data)
        trigger_preload = true
    }



    // var subj = "43"
    // var course = "748"
    // var ins = "691"



    // if (true) {
    //     // $("#subject").val(subj)
    //     // $("#subject").change();
    //
    //     $("#subject").change(function () {
    //         $("#course").val(course).trigger('change')
    //     })
    //
    //     $("#course").change(function () {
    //         $("#instructor").val(ins).trigger('change')
    //     })
    //
    //     $("#instructor").change(function () {
    //         $("#semester").val(sem).trigger('change')
    //     })
    //
    //     $("#subject").val(subj).trigger('change')
    // }


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

        // Fetch course data from API, based on selected subdepartment
        var subdeptID = $("#subject").val();
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

        if (trigger_preload) {
            console.log(preload_data.course)
            $("#course").val(preload_data.course).trigger('change')
        }
    });

    // Fetch instructor data on course select
    $("#course").change(function () {
        // Clear & disable sequenced dropdowns
        clearDropdown("#instructor");
        clearDropdown("#semester");
        // Enable instructor selector, disable the following
        $("#instructor").prop("disabled", false);
        $("#semester").prop("disabled", true);

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
        if (trigger_preload) {
            $("#instructor").val(preload_data.instructor).trigger('change')
            trigger_preload = false
        }
    });

    // Fetch semester data on instructor select
    $("#instructor").change(function () {
        // Clear & disable sequenced dropdowns
        clearDropdown("#semester");
        // Enable semester selector, disable the following
        $("#semester").prop("disabled", false);

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
    });

    setTimeout(() => {
            if (trigger_preload){
        console.log("cascading")
        $("#subject").val(preload_data.subject).trigger('change')
    }
    }, 1000)




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


    // setTimeout(() => {
    //     console.log("World!");
    //
    //     setSemester(setInstructor(setCourse(setSubject())))
    // }, 1);
    //
    // setDropdown("#subject", subj);
    // setDropdown("#course", course);
    // setDropdown("#instructor", ins);
    // setDropdown("#semester", sem);

    // data = {
    //     "subject": "43",
    //     "course": "748",
    //     "instructor": "691",
    //     "sem": "40"
    // }

    // console.log($("#subject").val())
    // setSubject(setCourse(setInstructor(setSemester())))
    // setSemester(setInstructor(setCourse(setSubject())))

    // console.log($("#subject").val())


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

});

// Clears all dropdown options & adds a disabled default option
function clearDropdown(id) {
    $(id).empty();
    $(id).html("<option value='' disabled selected>Select...</option>");
}

// Sets to
function setDropdown(id, choice) {
    setTimeout(() => {
        // console.log(id, choice)
        $(id).val(choice) //.trigger('change');
        $(id).change();
    }, 0)
    console.log($("#subject").val())
}

function setFixedDropdown(id, choice) {
    $(id).empty();
    $(id).html("<option value=`${choice.id}` disabled selected>Select...</option>");
}

function fillSubjects($) {
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
}

function fillCourses($) {
    // Fetch course data from API, based on selected subdepartment
    var subdeptID = $("#subject").val();
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
}

function fillInstructors($) {
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
}

function fillSemesters($) {
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
}