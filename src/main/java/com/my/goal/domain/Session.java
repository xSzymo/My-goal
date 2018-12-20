package com.my.goal.domain;

import java.io.Serializable;
import java.time.Instant;

public class Session extends AbstractAuditingEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    private Status status;
    private Instant createdDate;
    private Instant end;
    //not necessary, simple reminder - AP!
    private long duration;

    public Session() {
        this.status = Status.INP;
        createdDate = Instant.now();
    }

    public Status getStatus() {
        return status;
    }

    public long getDuration() {
        if(this.status.equals(Status.CLOSE))
            return end.getEpochSecond() - getCreatedDate().getEpochSecond();
        else
            return Instant.now().getEpochSecond() - getCreatedDate().getEpochSecond();
    }

    public void setStatus(Status status) {
        if(status.equals(Status.CLOSE) && this.status.equals(Status.INP))
            this.end = Instant.now();
        this.status = status;
    }

    public Instant getEnd() {
        return end;
    }

    public void setEnd(Instant end) {
        this.end = end;
    }

    @Override
    public Instant getCreatedDate() {
        return createdDate;
    }
}
