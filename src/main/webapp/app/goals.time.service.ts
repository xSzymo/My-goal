import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Goal, Session } from 'app/home/Goal';
import { SERVER_API_URL } from 'app/app.constants';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { GoalsService } from 'app/goals.service';
import { AccountService } from 'app/core';

@Injectable({
    providedIn: 'root'
})
export class TimeGoalsService {
    daysToShow = '7';

    constructor() {}
    public completedTimeToday(foundGoal: Goal): number {
        if (foundGoal == null || foundGoal.sessions.length === 0) {
            return 0;
        }
        const convertedGoal = GoalsService.createGoalInstance(foundGoal);
        const endDateInEpoch =
            new Date().getTime() <= convertedGoal.endDate.getTime() ? new Date().getTime() : convertedGoal.endDate.getTime();

        const startDate = Math.ceil(convertedGoal.startDate.getTime()) / (24 * 60 * 60 * 1000);
        const endDate = Math.ceil(endDateInEpoch) / (24 * 60 * 60 * 1000);
        const requiredTime = convertedGoal.daily * (Math.ceil(endDate) - Math.ceil(startDate) + 1);

        const completedSec = foundGoal.sessions.map((x: Session) => x.duration).reduce((a, b) => a + b);
        const expiredTime = Math.floor(completedSec / 60);
        if (completedSec < 60) {
            return 0;
        }

        return Math.floor((expiredTime / requiredTime) * 100);
    }

    public completedTimeWeek(goal: Goal): number {
        if (goal == null || goal.sessions.length === 0) {
            return 0;
        }
        const date = new Date();
        date.setDate(date.getDate() + 7);

        const convertedGoal = GoalsService.createGoalInstance(goal);
        const endDateInEpoch = date.getTime() <= convertedGoal.endDate.getTime() ? date.getTime() : convertedGoal.endDate.getTime();

        // const startDate = Math.ceil(convertedGoal.startDate.getTime()) / (24 * 60 * 60 * 1000);
        // const endDate = Math.ceil(endDateInEpoch) / (24 * 60 * 60 * 1000);
        // const requiredTime = convertedGoal.daily * (Math.ceil(endDate) - Math.ceil(startDate) + 1);
        const differenceBetweenEndAndStartDateInMilis = endDateInEpoch - new Date(convertedGoal.startDate).getTime();
        let days = 0;
        if (GoalsService.convertMilisToDays(differenceBetweenEndAndStartDateInMilis) === 0 && differenceBetweenEndAndStartDateInMilis > 0) {
            days = 1;
        } else {
            days = GoalsService.convertMilisToDays(differenceBetweenEndAndStartDateInMilis);
        }
        const requiredTime = days * convertedGoal.daily;

        const completedSec = goal.sessions.map((x: Session) => x.duration).reduce((a, b) => a + b);
        const expiredTime = Math.floor(completedSec / 60);
        if (completedSec < 60) {
            return 0;
        }

        return Math.floor((expiredTime / requiredTime) * 100);
    }

    public completedTimeMonth(goal: Goal): number {
        if (goal == null || goal.sessions.length === 0) {
            return 0;
        }
        const date = new Date();
        date.setDate(date.getDate() + 30);

        const convertedGoal = GoalsService.createGoalInstance(goal);
        const endDateInEpoch = date.getTime() <= convertedGoal.endDate.getTime() ? date.getTime() : convertedGoal.endDate.getTime();

        // const startDate = Math.ceil(convertedGoal.startDate.getTime()) / (24 * 60 * 60 * 1000);
        // const endDate = Math.ceil(endDateInEpoch) / (24 * 60 * 60 * 1000);
        // const requiredTime = convertedGoal.daily * (Math.ceil(endDate) - Math.ceil(startDate) + 1);
        const differenceBetweenEndAndStartDateInMilis = endDateInEpoch - new Date(convertedGoal.startDate).getTime();
        let days = 0;
        if (GoalsService.convertMilisToDays(differenceBetweenEndAndStartDateInMilis) === 0 && differenceBetweenEndAndStartDateInMilis > 0) {
            days = 1;
        } else {
            days = GoalsService.convertMilisToDays(differenceBetweenEndAndStartDateInMilis);
        }
        const requiredTime = days * convertedGoal.daily;

        const completedSec = goal.sessions.map((x: Session) => x.duration).reduce((a, b) => a + b);
        const expiredTime = Math.floor(completedSec / 60);
        if (completedSec < 60) {
            return 0;
        }

        return Math.floor((expiredTime / requiredTime) * 100);
    }

    public completedTime(goal: Goal): number {
        if (goal == null || goal.sessions.length === 0) {
            return 0;
        }

        const completedSec = goal.sessions.map((x: Session) => x.duration).reduce((a, b) => a + b);
        if (completedSec < 60) {
            return 0;
        }

        if (completedSec < 60) {
            return 0;
        }
        const differenceBetweenEndAndStartDateInMilis = new Date(goal.endDate).getTime() - new Date(goal.startDate).getTime();
        let days = 0;
        if (GoalsService.convertMilisToDays(differenceBetweenEndAndStartDateInMilis) === 0 && differenceBetweenEndAndStartDateInMilis > 0) {
            days = 1;
        } else {
            days = GoalsService.convertMilisToDays(differenceBetweenEndAndStartDateInMilis);
        }
        const requiredTimeInMin = days * goal.daily;
        const expiredTime = Math.floor(completedSec / 60);

        return Math.floor((expiredTime / requiredTimeInMin) * 100);
    }
    public getRequired(goal: Goal): number {
        if (goal == null) {
            return 0;
        }

        if (this.daysToShow === '1') {
            const differenceBetweenEndAndStartDateInMilis = new Date().getTime() - new Date(goal.startDate).getTime();
            return GoalsService.convertMilisToDays(differenceBetweenEndAndStartDateInMilis) * goal.daily + goal.daily;
        }
        if (this.daysToShow === '7') {
            const date = new Date();
            date.setDate(date.getDate() + 7);
            const endDate = date.getTime() <= new Date(goal.endDate).getTime() ? date : goal.endDate;
            const differenceBetweenEndAndStartDateInMilis = new Date(endDate).getTime() - new Date(goal.startDate).getTime();
            return GoalsService.convertMilisToDays(differenceBetweenEndAndStartDateInMilis) * goal.daily;
        }
        if (this.daysToShow === '30') {
            const date = new Date();
            date.setDate(date.getDate() + 30);
            const endDate = date.getTime() <= new Date(goal.endDate).getTime() ? date : goal.endDate;
            const differenceBetweenEndAndStartDateInMilis = new Date(endDate).getTime() - new Date(goal.startDate).getTime();
            return GoalsService.convertMilisToDays(differenceBetweenEndAndStartDateInMilis) * goal.daily;
        }
        if (this.daysToShow === '0') {
            const differenceBetweenEndAndStartDateInMilis = new Date(goal.endDate).getTime() - new Date(goal.startDate).getTime();
            return GoalsService.convertMilisToDays(differenceBetweenEndAndStartDateInMilis) * goal.daily;
        }
    }

    public getDaysToShow(): String {
        if (this.daysToShow === '1') {
            return 'Today\'s progress';
        }
        if (this.daysToShow === '7') {
            return 'Current week progress';
        }
        if (this.daysToShow === '30') {
            return 'Current month progress';
        }
        if (this.daysToShow === '0') {
            return 'All time progress';
        }
    }
}
