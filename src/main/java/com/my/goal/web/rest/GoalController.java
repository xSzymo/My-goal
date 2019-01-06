package com.my.goal.web.rest;

import com.my.goal.domain.Event;
import com.my.goal.domain.Session;
import com.my.goal.domain.Status;
import com.my.goal.repository.EventRepository;
import com.my.goal.security.SecurityUtils;
import com.sun.org.apache.xpath.internal.operations.Bool;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Stream;

//TODO CHARTS!!
@RestController
@RequestMapping("/api/goal")
public class GoalController {
    @Autowired
    private EventRepository eventRepository;

    @GetMapping("stop")
    public Stream<Event> stop() {
        return eventRepository
            .findAllByCreatedBy(SecurityUtils.getCurrentUserLogin()
                .orElse(null))
            .stream()
            .filter(this::isCurrentUserEqualToEventCreator)
            .filter(this::eventSessionsIncludesOpenStatus)
            .peek(x -> x.getSessions().forEach(x1 -> x1.setStatus(Status.CLOSE)))
            .map(eventRepository::save);
    }

    @GetMapping("start/{name}")
    public Stream<Event> start(@PathVariable("name") String name) {
        return eventRepository
            .findAllByCreatedBy(SecurityUtils.getCurrentUserLogin()
                .orElse(null))
            .stream()
            .filter(this::isCurrentUserEqualToEventCreator)
            .filter(x -> x.getName().equals(name))
            .filter(this::eventSessionsNotIncludesOpenStatus)
            .peek(x -> x.getSessions().add(new Session()))
            .map(eventRepository::save);
    }

//    @GetMapping("isStarted")
//    public IsStartedModel isStarted() {
//        return new IsStartedModel(eventRepository
//            .findAllByCreatedBy(SecurityUtils.getCurrentUserLogin()
//                .orElse(null))
//            .stream()
//            .anyMatch(this::eventSessionsIncludesOpenStatus));
//    }

    private boolean eventSessionsIncludesOpenStatus(Event event) {
        return event.getSessions().stream().anyMatch(session -> session.getStatus().equals(Status.INP));
    }
    private boolean eventSessionsNotIncludesOpenStatus(Event event) {
        return event.getSessions().stream().noneMatch(session -> session.getStatus().equals(Status.INP));
    }

    private boolean isCurrentUserEqualToEventCreator(Event event) {
        return StringUtils.equals(SecurityUtils.getCurrentUserLogin().orElse(null), event.getCreatedBy());
    }

//    private class IsStartedModel {
//        public Boolean isStarted = false;
//
//        public IsStartedModel() {
//        }
//
//        public IsStartedModel(boolean is) {
//            this.isStarted = is;
//        }
//    }
}
