package com.my.goal.domain;

public enum Status {
    INP("in progress"), CLOSE("closed");

    private String status;

    private Status(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }
}
