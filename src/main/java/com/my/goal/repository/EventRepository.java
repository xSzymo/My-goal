package com.my.goal.repository;

import com.my.goal.domain.Event;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends MongoRepository<Event, String> {

    List<Event> findAllByCreatedBy(String creator);

    List<Event> findByNameIgnoreCase(String name);

//    @Query("{ 'created_by' : ?0, 'sessions.start': { $gte: ?1, $lte: ?2} }")
//    List<Event> search(String owner, long from, long to);

}
