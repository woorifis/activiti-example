var APP = APP || {};
APP.users = [];
APP.groups = [];
APP.dynamicTasks = [];
APP.BASE_URL = SERVLET_CONTEXT+'/workflow/dynamicTasks/';

APP.dynamicTasksTpl = _.template(
    '<table class="table table-striped"> \
        <thead> \
            <tr> \
                <td>Position</td> \
                <td>Candidate Groups</td> \
                <td>Candidate Users</td> \
                <td>Description</td> \
                <td>&nbsp;</td> \
            </tr> \
        </thead> \
        <tbody>  \
            <% _.each(dynamicTasks, function(dynamicTask){ %> \
                <tr data-id="<%= dynamicTask.id %>" class="dynamicTask-row">  \
                    <td><%= dynamicTask.index %></td> \
                    <td>\
                        <select data-placeholder="Candidate Groups" class="chosen-select candidate-groups" data-position="<%= dynamicTask.index %>" multiple>\
                        <% _.each(groups, function(group){ %> \
                            <option value="<%= group.id %>" \
                            <% var selected = _.contains(dynamicTask.candidateGroups, group.id); %>\
                            <% if(selected){ %>\
                                selected \
                                <% } %>\
                            ><%= group.name %></option>\
                         <% }); %>\
                        </select>\
                    </td> \
                    <td>\
                        <select data-placeholder="Candidate Users" class="chosen-select candidate-users" data-position="<%= dynamicTask.index %>" multiple>\
                        <% _.each(users, function(user){ %> \
                            <option value="<%= user.userName %>" \
                            <% var selected = _.contains(dynamicTask.candidateUsers, user.userName); %>\
                            <% if(selected){ %>\
                                selected \
                                <% } %>\
                            ><%= user.userName %></option>\
                         <% }); %>\
                        </select>\
                    </td> \
                    <td> \
                       <div class="form-group"> \
                            <input type="text" class="form-control dynamicTask-name" id="dynamicTask-name-<%= dynamicTask.name %>" data-position="<%= dynamicTask.position %>" placeholder="Description" value="<%= dynamicTask.name %>"/>\
                        </div>\
                    </td>\
                    <td> \
                        <button type="button" class="btn btn-danger delete-button" data-position="<%= dynamicTask.index %>" data-id="<%= dynamicTask.id %>"> \
                            <span class="glyphicon glyphicon-trash"></span> \
                       </button> \
                    </td> \
                </tr> \
            <% }); %> \
        </tbody> \
    </table>'
);

function addNewDynamicTaskRow(pos) {
    var newList = [];
    _.each(APP.dynamicTasks, function (dynamicTask, index, list) {
        if (dynamicTask.index <= pos) {
            newList.push(dynamicTask);
        }
        if (dynamicTask.index === pos) {
            var newPos = pos + 1;
            newList.push({
                index: newPos,
                candidateGroups: [],
                candidateUsers: [],
                id: 'approveDocDynamicTask_' + newPos,
                name: 'Approve Document'
            });
        }
        if (dynamicTask.index > pos) {
            dynamicTask.index += 1;
            newList.push(dynamicTask);
        }
    });
    console.dir(newList);
    APP.dynamicTasks = newList;
}

function removeDynamicTaskRow(pos) {
    if (APP.dynamicTasks.length < 2) {
        bootbox.alert("At least one dynamicTask is required.", function() {});
        return;
    }
    APP.dynamicTasks.splice(pos -1, 1);
    _.each(APP.dynamicTasks, function (dynamicTask, index, list) {
        dynamicTask.index = index + 1;
    });
}

function getGroups() {
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: SERVLET_CONTEXT + '/groups',
        headers: {
            Accept: "application/json"
        },
        success: function (data) {
            console.dir(data);
            if (!data.success) {
                alert("There was an error getting the app groups");
            }
            else {
                APP.groups = data.data;
                console.dir(APP.groups);
            }
        },
        error: function (error) {
            alert("There was an error getting the groups");
        }
    });

}

function getUsers() {
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: SERVLET_CONTEXT + '/users',
        headers: {
            Accept: "application/json"
        },
        success: function (data) {
            console.dir(data);
            if (!data.success) {
                alert("There was an error getting the app users");
            }
            else {
                APP.users = data.data;
                console.dir(APP.users);
            }

        },
        error: function (error) {
            alert("There was an error getting the app users");
        }
    });
}

function getDynamicTasks(group, docType) {
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: APP.BASE_URL+docType +'/'+group+'',
        headers: {
            Accept: "application/json"
        },
        success: function (data) {
            if (!data.success) {
                alert("There was an error updating the workflow");
            }
            $('#tasksGroupLabel').text(data.message);
            APP.dynamicTasks = data.data;
            updateDynamicTasksTpl(APP.dynamicTasks);
            $('#dynamicTasks').removeClass('hidden').addClass('show');
            //var newSrc = SERVLET_CONTEXT + '/workflow/diagrams/' + DOC_dynamicTask_ROOT_ID + '-' + group;
            var newSrc ="http://placehold.it/800x150.png";
            var rand = _.random(1, 100000000);
            //newSrc = newSrc + '?rand=' + rand
            $('#proc-main-diagram').attr('src', newSrc);
            //    //need to add random param to avoid caching of the image
            //    var rand = _.random(1, 100000000);
            //    newSrc = newSrc + '?rand=' + rand
            //    $('#proc-main-diagram').attr('src', newSrc);
            //    $('#groupTitle').text(group);
            //}
            //else {
            //    $('#dynamicTasks').addClass('hidden');
            //    var newSrc = SERVLET_CONTEXT + '/workflow/diagrams/' + DOC_dynamicTask_ROOT_ID;
            //    $('#proc-main-diagram').attr('src', newSrc);
            //    $('#groupTitle').text('Default');
            //}
        },
        error: function (error) {
            alert("There was an error updating the workflow");
        }
    });
}

function updateDynamicTasksTpl() {
    $('#userTasks-panel').html(APP.dynamicTasksTpl({
        dynamicTasks: APP.dynamicTasks,
        groups: APP.groups,
        users: APP.users
    }));
    $('.chosen-select', '#userTasks-panel').chosen({ width: '100%' }).change(function () {
        var pos = parseInt($(this).attr('data-position'));
        var temp = $(this).val();
        var tempArray = _.isArray(temp) ? temp : [temp];
        if ($(this).hasClass('candidate-groups')) {
            APP.dynamicTasks[pos].candidateGroups = tempArray;
        }
        else {
            APP.dynamicTasks[pos].candidateUsers = tempArray;
        }
    });
    $('input.dynamicTask-name', '#userTasks-panel').on('blur', function(){
        var pos = parseInt($(this).attr('data-position'));
        APP.dynamicTasks[pos].name = $(this).val();
    });
    //$('button.add-button', '#userTasks-panel').on('click', function () {
    //    var pos = $(this).attr('data-position');
    //    addNewDynamicTaskRow(parseInt(pos));
    //    updateDynamicTasksTpl();
    //});
    $('button.delete-button', '#userTasks-panel').on('click', function () {
        var pos = $(this).attr('data-position');
        removeDynamicTaskRow(parseInt(pos));
        updateDynamicTasksTpl();
    });
}

function updateDynamicTasks(group, docType) {
    var _group = group;
    var _docType = docType;
    $.ajax(APP.BASE_URL+ _docType + '/' + _group, {
        type: 'PUT',
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(APP.dynamicTasks),
        headers: {
            Accept: "application/json"
        },
        success: function (data) {
            console.dir(data);
            //var newSrc = SERVLET_CONTEXT + '/workflow/' + _group + '/diagrams/' + DOC_dynamicTask_ROOT_ID + '-' + ;
            var newSrc ="http://placehold.it/800x200.png";
            var rand = _.random(1, 100000000);
            //newSrc = newSrc + '?rand=' + rand
            $('#proc-main-diagram').attr('src', newSrc);
            if (!data.success) {
                alert("There was an error updating the workflow.");
            }
            else {
                updateDynamicTasks(_group, _docType);
            }

        },
        error: function (error) {
            alert("There was an error getting the app users");
        }

    });
}

$(function () {
    $(document).ajaxStart($.blockUI).ajaxStop($.unblockUI);
    getGroups();
    getUsers();
    $('#update-button').on('click', function () {
        var group = $("#groupSel").val();
        var docType = $('#docType').val();
        if (!_.isEmpty(group) && !_.isEmpty(docType)) {
            updateDynamicTasks(group, docType);
        }
    });
    //hide and show the group select based on docType
    $('#docTypeSel').change(function(){
        //$("#my-Select option[text=" + myText +"]").attr("selected","selected") ;
        //$("#groupSel option[text=" + "Choose a Document Type" + "]").attr("selected", "selected");
        $("#groupSel").val("");
        var val = $(this).val();
        if (_.isEmpty(val)){
            $('#groupSelForm').addClass('hidden');//.find('option').remove().end();//.append('<option value="whatever">text</option>').val('whatever');
        }
        else {
            $('#groupSelForm').removeClass('hidden');
        }
    });

    $('#groupSel').change(function () {
        var group =  $(this).val();
        var docType = $('#docTypeSel').val();
        if (_.isEmpty(group) || _.isEmpty(docType)){
            return;
        }
        //alert("DocType =" + docType + ", group =" + group);
        getDynamicTasks(group, docType);
    });
    //set up JQuery choosen plugin
    var config = {
        '.chosen-select': {},
        '.chosen-select-deselect': {allow_single_deselect: true},
        '.chosen-select-no-single': {disable_search_threshold: 10},
        '.chosen-select-no-results': {no_results_text: 'Oops, nothing found!'}
//        '.chosen-select-width': {width: "95%"}
    }
    for (var selector in config) {
        $(selector).chosen(config[selector]);
    }

});


