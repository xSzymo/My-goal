package com.my.goal.domain;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

/**
 * A user.
 */

@org.springframework.data.mongodb.core.mapping.Document(collection = "jhi_event")
@org.springframework.data.elasticsearch.annotations.Document(indexName = "event")
@NoArgsConstructor
@AllArgsConstructor
public class Event extends AbstractAuditingEntity implements Serializable {

    private static final long serialVersionUID = 1L;
    @Id
    private String id;

    @NotNull
//    @Pattern(regexp = Constants.LOGIN_REGEX)
    @Size(min = 1, max = 50)
    @Indexed
    private String name;

    @Indexed
    private int daily = 0;
//    @Indexed
    //just for lollll?
    private int total = 0;

    //    @Pattern(regexp = Constants.LOGIN_REGEX)
//    @Size(min = 1, max = 50)
    @Indexed
    private Instant endDate;

    private Set<Session> sessions = new HashSet<>();

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    // Lowercase the login before saving it in database
    public void setName(String login) {
        this.name = login;
    }

    public Instant getEndDate() {
        return endDate;
    }

    public void setEndDate(Instant endDate) {
        this.endDate = endDate;
    }

    public Set<Session> getSessions() {
        return sessions;
    }

    public void setSessions(Set<Session> sessions) {
        this.sessions = sessions;
    }

    public int getDaily() {
        return daily;
    }

    public void setDaily(int daily) {
        this.daily = daily;
    }

    public long getTotal() {
        long sum = this.sessions.stream().mapToLong(Session::getDuration).sum();
        return sum > 0 ? sum / 60 : 0;
    }

//    public void setTotal(int total) {
//        this.total = total;
//    }

    public Instant getStartDate() {
        return getCreatedDate();
    }
}
