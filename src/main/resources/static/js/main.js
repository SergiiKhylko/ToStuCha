var messageApi = Vue.resource('/message{/id}');
var stompClient = null;
var messages = null;

Vue.component('msg-body', {
    props: ['messages'],
    data: function() {
        return {
            greeting: 'Hello, Vue!!',
            title: 'ToStuCha',
            editMessage: ''
        }
    },
    template: '<div><h1>{{title}}</h1>' +
              '<h3>{{greeting}}</h3>' +
              '<ol>' +
                   '<msg-item :messages="messages" ' +
                               'v-for="item in messages" ' +
                               ':editMethod="editMethod" ' +
                               ':msg="item" ' +
                               ':key="item.id"> ' +
                   '</msg-item> ' +
              '</ol>' +
                    '<message-form :messages="messages" :editMessage="editMessage"/>' +
              '</div>',
    methods: {
         editMethod: function(message) {
                 this.editMessage = message;
         }
    }
});


Vue.component('msg-item', {
  props: ['msg', 'messages', 'editMethod'],
  template: '<li>{{ msg.text }}' +
                '<span style="position: absolute; right: 0">' +
                                 '<input type="button" value="Edit" @click="edit" />' +
                                 '<input type="button" value="X" @click="del" />' +
                '</span>' +
            '</li>',
  methods: {
    edit: function() {
        this.editMethod(this.msg)
    },
    del: function() {
        messageApi.remove({id: this.msg.id}).then(result => {
            if (result.ok) {
                this.messages.splice(this.messages.indexOf(this.msg), 1)
                changeNotify();
            }
        })
    }
  }
});


Vue.component('message-form', {
    props: ['messages', 'editMessage'],
    data: function() {
        return {
            text: '',
            id: ''
        }
    },
    watch: {
        editMessage: function(newVal, oldVal) {
            this.text = newVal.text;
            this.id = newVal.id;
        }
    },
    template:
        '<div>' +
            '<input type="text" @keyup.enter="save" placeholder="Write something" v-model="text" />' +
            '<input type="button" value="Save" @click="save"/>' +
        '</div>',
    methods: {
        save: function() {
            var message = { text: this.text };

            if (this.id) {
                messageApi.update({id: this.id}, message).then(result =>
                    result.json().then(data => {
                        var index = getIndex(this.messages, data.id);
                        this.messages.splice(index, 1, data);
                        this.text = '';
                        this.id = ''
                        changeNotify();
                    })
                )
            } else {
                messageApi.save({}, message).then(result =>
                    result.json().then(data => {
                        this.messages.push(data);
                        this.text = ''
                        changeNotify();
                    })
                )
            }

        }
    }
});

var app = new Vue({
  el: '#app',
  data: {
    messages: []
  },
  template: '<msg-body :messages="messages" />',
  created: function() {
      messageApi.get().then(result => this.messages = result.body);
      var socket = new SockJS('/gs-guide-websocket');
      stompClient = Stomp.over(socket);
      stompClient.connect({}, function (frame) {
         console.log('Connected: okokokokoko');
         stompClient.subscribe('/topic/updated', function (greeting) {
            updateMessages();
         });
      });
  }
})

function getIndex(list, id) {
    for (var i = 0; i < list.length; i++ ) {
        if (list[i].id === id) {
            return i;
        }
    }

    return -1;
}

function changeNotify() {
    stompClient.send("/app/hello", {}, JSON.stringify({'name': 'updated'}));
}

function updateMessages() {
    messageApi.get().then(result => app.messages = result.body);
}
