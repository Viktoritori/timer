import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {interval, NEVER, Subject, fromEvent, Subscription} from 'rxjs';
import {switchMap, debounceTime} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('waitButton', { static: true }) button: ElementRef;
  source = interval(1000);
  pauser = new Subject();
  currTime = 0;
  isPaused = false;
  isStopped = true;
  subscription: Subscription;


  ngOnInit(): void {
    this.pauser.pipe(
      switchMap(paused => paused ? NEVER : this.source),
    )
      .subscribe(val => this.currTime++);

    this.subscription = fromEvent(this.button.nativeElement, 'dblclick')
      .pipe(
        debounceTime(300)
      ).subscribe(() => this.wait());
  }

  handleTimerState(): void {
    if (this.isPaused) {
      this.pauser.next(false);
      this.isPaused = false;
      return;
    }

    this.isStopped = !this.isStopped;
    this.currTime = 0;
    this.pauser.next(this.isStopped);
  }

  wait(): void {
    this.isPaused = true;
    this.pauser.next(true);
  }

  resetTimer(): void {
    this.currTime = 0;
    this.pauser.next(false);
    this.isPaused = false;
  }

  get formattedTime(): any {
    return new Date(this.currTime * 1000).toISOString().substr(11, 8);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
