package com.ajkko.ToStuCha.controller;

import com.ajkko.ToStuCha.exception.NotFoundException;
import com.ajkko.ToStuCha.model.Message;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("message")
public class MessageController {

    private int counter = 0;

    private List<Message> messages = new ArrayList<>();

    @GetMapping()
    public List<Message> getMessages() {
        return messages;
    }

    @GetMapping("{id}")
    public Message getMessage(@PathVariable long id) {
        return messages.stream()
                .filter(message -> message.getId() == id)
                .findFirst()
                .orElseThrow(NotFoundException::new);
    }

    @PostMapping
    public Message createMessage(@RequestBody Message message) {
        message.setId(counter++);
        messages.add(message);
        return message;
    }

    @PutMapping("{id}")
    public Message updateMessage(@PathVariable long id,
                                 @RequestBody Message message) {
        Message messageFromDb = getMessage(id);
        messageFromDb.setText(message.getText());
        return messageFromDb;
    }

    @DeleteMapping("{id}")
    public void deleteMessage(@PathVariable long id) {
        messages.remove(getMessage(id));
    }

}
