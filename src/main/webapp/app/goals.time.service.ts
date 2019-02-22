import { Injectable } from '@angular/core';
import { Goal, Session } from 'app/home/Goal';
import { GoalsService } from 'app/goals.service';

@Injectable({
    providedIn: 'root'
})
export class TimeGoalsService {
    daysToShow = '7';

    constructor() {}

    public completedTime(goal: Goal): number {
        return this.calculateCompletedTime(goal, this.getAllDaysToEnd(goal));
    }

    public calculateCompletedTime(goal: Goal, daysToAdd: number): number {
        if (goal == null || goal.sessions.length === 0) {
            return 0;
        }
        const date = new Date();
        date.setDate(date.getDate() + daysToAdd);
        const convertedGoal = GoalsService.createGoalInstance(goal);
        return Math.floor((this.getExpiredTime(convertedGoal) / this.getRequiredTime(convertedGoal, date)) * 100);
    }

    public getRequired(goal: Goal): number {
        if (goal == null) {
            return 0;
        } else if (this.daysToShow === '1') {
            const differenceBetweenEndAndStartDateInMilis = new Date().getTime() - new Date(goal.startDate).getTime();
            return GoalsService.convertMilisToDays(differenceBetweenEndAndStartDateInMilis) * goal.daily + goal.daily;
        } else if (this.daysToShow === '7') {
            return this.convertDate(goal, new Date(), 7);
        } else if (this.daysToShow === '30') {
            return this.convertDate(goal, new Date(), 30);
        } else if (this.daysToShow === '0') {
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

    private convertDate(goal: Goal, date: Date, days: number): number {
        date.setDate(date.getDate() + days);
        const endDate = date.getTime() <= new Date(goal.endDate).getTime() ? date : goal.endDate;
        const differenceBetweenEndAndStartDateInMilis = new Date(endDate).getTime() - new Date(goal.startDate).getTime();
        return GoalsService.convertMilisToDays(differenceBetweenEndAndStartDateInMilis) * goal.daily;
    }

    private getAllDaysToEnd(goal: Goal): number {
        return Math.round(Math.abs((new Date(goal.startDate).getTime() - new Date(goal.endDate).getTime()) / (24 * 60 * 60 * 1000)));
    }

    private getExpiredTime(goal: Goal): number {
        const completedSec = goal.sessions.map((x: Session) => x.duration).reduce((a, b) => a + b);
        const expiredTime = Math.floor(completedSec / 60);
        if (completedSec < 60) {
            return 0;
        }
        return expiredTime;
    }

    private getRequiredTime(goal: Goal, date: Date): number {
        const endDateInEpoch = date.getTime() <= goal.endDate.getTime() ? date.getTime() : goal.endDate.getTime();
        const differenceBetweenEndAndStartDateInMilis = endDateInEpoch - new Date(goal.startDate).getTime();
        const convertedMilisToDays = GoalsService.convertMilisToDays(differenceBetweenEndAndStartDateInMilis);
        const days = convertedMilisToDays === 0 && differenceBetweenEndAndStartDateInMilis > 0 ? 1 : convertedMilisToDays;
        return days * goal.daily;
    }
}
