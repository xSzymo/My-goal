package com.my.goal.web.rest;

import com.my.goal.domain.Event;
import com.my.goal.repository.EventRepository;
import com.my.goal.security.SecurityUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/goal")
public class EventController {
    @Autowired
    private EventRepository eventRepository;

    @PostMapping("events")
    public Event create(@RequestBody Event event) {
        if (event.getEndDate() == null || (event.getEndDate().getEpochSecond() <= Instant.now().getEpochSecond()))
                return null;
        if (!isEventUnique(event))
            return null;

        return eventRepository.save(event);
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
        @RequestParam(name = "to", required = false, defaultValue = "2208988800") String to) {
        return eventRepository
            .findAllByCreatedBy(SecurityUtils.getCurrentUserLogin().orElse(null))
            .stream()
            .filter(this::isCurrentUserEqualToEventCreator)
            .filter(event -> this.isEventDateBetweenGivenTimes(event, Long.parseLong(from), Long.parseLong(to)))
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

    private boolean isEventUnique(Event event) {
        return eventRepository
            .findAllByCreatedBy(SecurityUtils.getCurrentUserLogin().orElse(null))
            .stream()
            .filter(this::isCurrentUserEqualToEventCreator)
            .noneMatch(currentEvent -> currentEvent.getName().equals(event.getName()));
    }

    private boolean isCurrentUserEqualToEventCreator(Event event) {
        return StringUtils.equals(SecurityUtils.getCurrentUserLogin().orElse(null), event.getCreatedBy());
    }

    private boolean isEventDateBetweenGivenTimes(Event event, long from, long to) {
        return event.getCreatedDate().getEpochSecond() >= from && event.getCreatedDate().getEpochSecond() <= to;
    }
}
