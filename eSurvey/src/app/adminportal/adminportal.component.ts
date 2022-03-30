import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from '../user.service';

@Component({
  selector: 'app-adminportal',
  templateUrl: './adminportal.component.html',
  styleUrls: ['./adminportal.component.scss']
})
export class AdminportalComponent implements OnInit {


  username : any = sessionStorage.getItem('username');
  emailId :any =sessionStorage.getItem('email');
  destroy$: Subject<boolean> = new Subject<boolean>();
  questions: any;
  results: any=[];
  options: any;
  questionForm:any;
  questOption: any;
  
  constructor(private userService :UserService,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.getAllQuestions();
    // this.questionForm = new FormArray([]);
    this.createQuestForm();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }


  createQuestForm(){

    this.questionForm = this.fb.group({
      Question: '',
      options: this.fb.array([
       

      ])
    });

  }
  // "optionID": '',
  // "optionDesc" : ''

  getAllQuestions() {
    this.userService.getAllQuestions().pipe(takeUntil(this.destroy$)).subscribe((data:any) => {
      
        console.log('allQuestions',data.consultations);
        this.questions = data.consultations.Questions;
      
       this.questions.forEach((element: { id: any;Text :any }) => {
        this.getQuestionOptions(element.id);
          this.getResultsById(element.id);
       });
       
    });
  }

  getResultsById(id?:any){
    this.userService.getQuestionResponseById(id).pipe(takeUntil(this.destroy$)).subscribe((data:any) => {

      console.log('alloptions',data);
     this.results.push(data);
     console.log(this.results);

  });
  }

  getQuestionOptions(id:any){

    this.userService.getAllOptionsById(id).pipe(takeUntil(this.destroy$)).subscribe((data:any) => {

      console.log('alloptions',data.options);
      this.options = data.options;
      this.questOption =this.options;

  });
  }


  // editQuestion(id:any): void{

  //   this.questionForm.push(new FormControl(''));
  //   let Question = this.questionForm.get("options") as FormArray;

    
  // }

  editQuestion(id:any) {
    let Question = this.questionForm.get("options") as FormArray;

    this.getQuestionOptions(id);
    this.options.forEach((element: { id: any;Text :any })=> {

      var optionID =element.id;
      Question.push(this.fb.group({
        optionID  :[element.Text, Validators.required]
      }));

    });
  
  }
}
