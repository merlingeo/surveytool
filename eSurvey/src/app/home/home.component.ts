import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from '../user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();
  questions : any;
  options :any;
  questionForm: any;
  optionselected :any;
  isdisabled :boolean =false;
  allanswers: any=[];
  emailId :any =sessionStorage.getItem('email');
  chosenItem :any;
  username : any = sessionStorage.getItem('username');
  constructor(private userService :UserService,
    private fb: FormBuilder) { }
 

  ngOnInit(): void {
    this.getAllQuestions();
    this.createQuestForm();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  createQuestForm(){

    this.questionForm = this.fb.group({
      useremail: this.emailId,
      questionanswers: this.fb.array([
        
      ])
    });

  }

  addQuestionArray(qestID:any) {
    let Question = this.questionForm.get("questionanswers") as FormArray;
    Question.push(this.fb.group({
      "questID": [qestID, Validators.required],
      "ansID":['', Validators.required]
    }));
  }

  getAllQuestions() {
    this.userService.getAllQuestions().pipe(takeUntil(this.destroy$)).subscribe((data:any) => {
      
        // this.users = users;
        // console.log('allQuestions',data.consultations);
        this.questions = data.consultations.Questions;
       // this.addQuestionArray(id);
       this.questions.forEach((element: { id: any;Text :any }) => {
          this.addQuestionArray(element.id);
       });
       
    });
  }

  onExpansion(id: any){
    console.log('expanded id :',id);
   
    this.userService.getAllOptionsById(id).pipe(takeUntil(this.destroy$)).subscribe((data:any) => {

      console.log('alloptions',data.options);
      this.options = data.options;
      
  });
    
  }

  setAnswers(index:any,questId:any, ansId?:any){

    console.log('answes>>>>>>>>>>',index,questId,ansId);
      this.questionForm.controls["questionanswers"].at(index).setValue({ "questID": questId, "ansID": ansId });

  }

  onSubmitSurvey(){

    this.userService.saveSurvey(this.questionForm.getRawValue()).pipe(takeUntil(this.destroy$)).subscribe((data:any) => {
      console.log('message::::', data);
      
    });
  }
}
