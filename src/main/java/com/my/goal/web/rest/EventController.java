package com.my.goal.web.rest;

import com.my.goal.domain.Event;
import com.my.goal.repository.EventRepository;
import com.my.goal.security.SecurityUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

//TODO : update?
//TODO : just for sessions?
//TODO : repo acccess improvements
@RestController
@RequestMapping("/api/goal")
public class EventController {
    @Autowired
    private EventRepository eventRepository;

    @PostMapping("events")
    public Event create(@RequestBody Event event) {
//        if (event.getEndDate() != null)
//            if (event.getEndDate().getEpochSecond() <= Instant.now().getEpochSecond() || ChronoUnit.DAYS.between(event.getEndDate(), Instant.now()) == 0)//TODO
                //need to get general days isntead of alls econds
//                return null;

        boolean eventWithThatNameAlreadyExist = eventRepository
            .findAllByCreatedBy(SecurityUtils.getCurrentUserLogin().orElse(null))
            .stream()
            .filter(this::isCurrentUserEqualToEventCreator)
            .anyMatch(x -> x.getName().equals(event.getName()));

        if (!eventWithThatNameAlreadyExist)
            return eventRepository.save(event);
        else
            return null;
    }

    @GetMapping("events/{name}")
    public Stream<Event> find(@PathVariable("name") String name) {
        return eventRepository
            .findByNameIgnoreCase(name)
            .stream()
            .filter(this::isCurrentUserEqualToEventCreator)
            .limit(1);
    }

    @GetMapping("events")
    public Set<Event> findAll(
        @RequestParam(name = "from", required = false, defaultValue = "0") String from,
        @RequestParam(name = "to", required = false, defaultValue = "2208988800") String to) {//an easter egg :P
        return eventRepository
            .findAllByCreatedBy(SecurityUtils.getCurrentUserLogin().orElse(null))
            .stream()
            .filter(this::isCurrentUserEqualToEventCreator)
            .filter(x -> this.isCurrentUserEqualToEventCreator(x, Long.parseLong(from), Long.parseLong(to)))
            .collect(Collectors.toSet());
    }

    @DeleteMapping("events/{name}")
    public Stream<Event> delete(@PathVariable("name") String name) {
        return eventRepository
            .findByNameIgnoreCase(name)
            .stream()
            .filter(this::isCurrentUserEqualToEventCreator)
            .peek(eventRepository::delete);
    }

    private boolean isCurrentUserEqualToEventCreator(Event event) {
        return StringUtils.equals(SecurityUtils.getCurrentUserLogin().orElse(null), event.getCreatedBy());
    }

    private boolean isCurrentUserEqualToEventCreator(Event event, long from, long to) {
        return event.getCreatedDate().getEpochSecond() >= from && event.getCreatedDate().getEpochSecond() <= to;
    }

//    private boolean isCurrentUserEqualToEventCreator(Event event, long from, long to) {
//        return event.getSessions().stream().anyMatch(session -> session.getCreatedDate().getEpochSecond() >= from && session.getCreatedDate().getEpochSecond() <= to);
//    }
}
