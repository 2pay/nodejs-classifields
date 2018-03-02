$(function() {
    $('body').append('<div id="preloader"></div>');
    $("#tabs").tabs();
    $(document).tooltip();
    $(".datepicker").datepicker({ minDate: "-2Y" });
    checkall();
});

$(function() {
    $("#add-priceRange").click(function(e) {
        e.preventDefault();
        $("#priceRange").each(function() {
            var tds = '<tr>';
            jQuery.each($('tr:last td', this), function() {
                tds += '<td>' + $(this).html() + '</td>';
            });
            tds += '</tr>';
            if ($('tbody', this).length > 0) {
                $('tbody', this).append(tds);
            } else {
                $(this).append(tds);
            }
        });
    });

    $("#remove-priceRange").click(function(e) {
        e.preventDefault();
        var rowCount = $('#priceRange tr').length;
        if (rowCount > 1) {
            $('#priceRange tr:last').remove();
        } else { return; }
    });
});

$(function() {
    $('.widget-content input.toplevel:checkbox').click(function() {

        if ($('.widget-content').find('input.toplevel:checkbox').is(':checked')) {
            $('.widget-content').find('input.checkall:checkbox').attr("disabled", true);
            $('.widget-content').find('input.checkall:checkbox').attr("checked", false);
        } else {
            $('.widget-content').find('input.checkall:checkbox').removeAttr("disabled");
        }

    });
});

function imageIsLoaded(e) {
    $('#filePreview').append('<img src="' + e.target.result + '" />');
};

function thumbPreview(input) {
    var count = 0;
    if (input.files && input.files[0]) {
        for (var i = 0; i < input.files.length; i++) {
            var reader = new FileReader();
            reader.onload = imageIsLoaded;
            reader.readAsDataURL(input.files[i]);
            count++;
        }
        $('#totalImages').html('Bạn đã chọn <strong>' + count + '</strong> hình');
    }
}

function submitform(id) {
    $('#' + id).l2block();
    httplocal = location.href;
    var jqxhr = $.post(httplocal, $("#" + id).serialize(), function(data) {
        if (data.status == 0) {
            $("#" + id).l2error(data.msg);
            $("#" + id).l2unblock();
        } else if (data.status == 1) {
            $("#" + id).l2success(data.msg);
            $("#" + id).l2unblock();
        } else if (data.status == 2) {
            $("#" + id).l2success(data.msg);
            $("#" + id).l2unblock();
            document.getElementById(id).reset();
        } else if (data.status == 3) {
            $("#" + id).l2success(data.msg);
            $("#" + id).l2unblock();
            $("html, body").animate({ scrollTop: 0 }, 600);
        } else if (data.status == 4) {
            eval(data.msg);
        } else if (data.status == 5) {
            $("#" + id).l2success(data.msg);
            $("#" + id).l2unblock();
            $("#" + id).remove();
        } else if (data.status == 6) {
            eval(data.msg);
            $("#" + id).l2unblock();
        }
    }, "json")
    return false;
}

function checkall() {
    $("#checkall").click(function() {
        $(".checkall").attr("checked", this.checked);
    });
    $("#checkall2").click(function() {
        $(".checkall2").attr("checked", this.checked);
    });
}

function showWindowsModal() {
    $("#dialog:ui-dialog").dialog("destroy");
    $("#dialog-message").dialog({
        modal: true,
        autoOpen: false,
        resizable: false,
        width: 700,
    });
}

function openWindows(vtitle, divid) {
    $("#dialog-message").remove();
    var dcontent = $("#" + divid).html();
    $('body').append('<div id="dialog-message" title=""></div>');
    $("#dialog-message").attr('title', vtitle);
    $("#dialog-message").html(dcontent);
    showWindowsModal();
    $("#dialog-message").dialog("open");
}

function selectowner() {
    var owner = $("#owner").val();
    if (owner == 'single') {
        $("#username").fadeIn();
    } else {
        $("#username").fadeOut();
    }
}

function updfrmvars(frmoption) {
    $.each(frmoption, function(key, val) {
        $("#" + key).val(val);
    });
}

function showeditmsg(id) {
    $("#msg-" + id).hide();
    $("#edit-" + id).fadeIn();
}

function hideeditmsg(id) {
    $("#edit-" + id).hide();
    $("#msg-" + id).fadeIn();
}

function receivertype() {
    var receiverlist = $("#receiverlist").val();
    if (receiverlist != 'single') {
        $("#singlemember").fadeOut();
        $("#maxperpage").fadeIn();
    } else {
        $("#singlemember").fadeIn();
        $("#maxperpage").fadeOut();
    }
}

function shownotes() {
    $("#mynotes").toggle('slow');
}

function savenotes() {
    $("#mynotes").hide('slow');
    var jqxhr = $.post("./", $("#savenotesform").serialize(), function(data) {
        if (data.status == 0) {
            alert('Error connecting to the server, your notes cannot be saved');
            $("#mynotes").show('slow');
        }
    }, "json")
    return false;
}


function redirectpage(url) {
    setTimeout("location.href = '" + url + "'", 1000);
}

function getCity(cityId, oldId, newId) {
    $(function() {

        var path = "";
        $("#citiesCountry").empty();

        if (oldId === newId || newId === null) {
            path = "/api/cities-by-country/" + oldId;
        } else {
            path = "/api/cities-by-country/" + newId;
        }

        $.getJSON(path, function(data) {

            $.each(data, function(i, field) {
                var html = '';
                if (cityId === field._id) {
                    html += '<input type="radio" name="city" value="' + field._id + '" class="checkall3" checked /> <strong>' + field.name + '</strong><br />';
                } else {
                    html += '<input type="radio" name="city" value="' + field._id + '" class="checkall3" /> ' + field.name + '<br />';
                }
                $("#citiesCountry").append(html);
            });

        });

    });
}