package com.my.goal.repository;

import com.my.goal.domain.Event;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventRepository extends MongoRepository<Event, String> {

//    Optional<Event> findOneByActivationKey(String activationKey);
//
//    List<Event> findAllByActivatedIsFalseAndCreatedDateBefore(Instant dateTime);
//
//    Optional<Event> findOneByResetKey(String resetKey);
//
//    Optional<Event> findOneByEmailIgnoreCase(String email);
//
//    Optional<Event> findOneByLogin(String login);
//
//    Page<Event> findAllByLoginNot(Pageable pageable, String login);
}
