package com.my.goal.repository;

import com.my.goal.domain.Event;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

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
    List<Event> findAllByCreatedBy(String creator);

    Optional<Event> findByName(String name);

//    @Query("{ 'created_by' : ?0, 'sessions.start': { $gte: ?1, $lte: ?2} }")
//    List<Event> search(String owner, long from, long to);

}
