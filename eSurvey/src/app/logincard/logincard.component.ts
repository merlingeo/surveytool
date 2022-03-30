import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators,FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { UserService } from '../user.service';
import * as shajs from 'sha.js';

@Component({
  selector: 'app-logincard',
  templateUrl: './logincard.component.html',
  styleUrls: ['./logincard.component.scss']
})
export class LogincardComponent implements OnInit {

  panelOpenState = false;
  loginForm: any;
  isRegister: boolean=false;
  registerForm: any;
  scannerEnabled:boolean=false;
  // isScannerOpen:boolean=false;
  sniarray:any=[];

  destroy$: Subject<boolean> = new Subject<boolean>();
  
  constructor(private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService :UserService) { }

  ngOnInit(): void {
    // this.isRegister=false;
    this.createLoginForm();
    this.getALlSNI();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  createLoginForm(){

    this.loginForm = this.fb.group({
      "email": ["", Validators.required],
      "password":["", Validators.required]
    });

    
  }
  
  onSubmit(){
    console.log(this.loginForm.value);
    let hash = shajs('sha256').update(this.loginForm.value.password).digest('hex');
    console.log(hash);

    this.userService.userLogin({emailid :this.loginForm.value.email,hashpass :hash}).pipe(takeUntil(this.destroy$)).subscribe((data:any) => {
      console.log('message::::', data);
      if(data.statuscode)
      sessionStorage.setItem('username', data.username);
      sessionStorage.setItem('email', data.userId);
      if(!!data.user){
        this.router.navigate(['/adminportal']);
      }else{
        this.router.navigate(['/home']);
      }
      // this.loginForm.reset();
    });
  }

  routeRegister(){
    this.isRegister = true;
    this.createRegisterationForm();
    // this.router.navigate(['/register']);
  }
  
  createRegisterationForm(){
    this.registerForm = this.fb.group({
      newemail: [null, [Validators.required, Validators.email]],
      fullname: [null, Validators.required],
      dob: [null, Validators.required],
      address: [null, Validators.required],
      newpassword: [null, [Validators.required,Validators.minLength(5)]],
      snino: [null, [Validators.required]]
    });
    
  }

  routeLogin(){
    this.isRegister = false;
  }

  onAdminSubmit(){
    if(this.loginForm.value.email=='admin@shangrila.gov.uk'){
      this.onSubmit();
    }else{
      //
    }
  }

  onRegisterationSubmit(regform?:any){
    let hash = shajs('sha256').update(this.registerForm.value.newpassword).digest('hex');
    console.log(hash);

    this.registerForm.get("newpassword").patchValue(hash);
    console.log(regform);

    this.userService.userRegisteration(this.registerForm.value).pipe(takeUntil(this.destroy$)).subscribe((data:any) => {
      console.log('message::::', data);
      if(data.statuscode ==200){
        window.location.reload();
      }else if(data.statuscode != 200){
              this.registerForm.resetForm();
      }else{
        this.registerForm.resetForm();
      }
    });

  }

  get f() { return this.registerForm.controls; }

  scanSuccessHandler(event:any){
    console.log(event);
    this.registerForm.get("snino").patchValue(event);
    this.scannerEnabled=false;
    
  }

  scanQRcode(){
    this.scannerEnabled=true;
    this.registerForm.get("snino").patchValue('');
  }
  disableScanner(){
    this.scannerEnabled=false;
  }

  checkInUseSNI(control:FormControl) {

    return new Observable(observer => {
      setTimeout(() => {
        let result = (this.sniarray.indexOf(control.value) !== -1) ? { 'alreadyInUse': true } : null;
        observer.next(result);
        observer.complete();
      }, 4000)
    })
  }

  getALlSNI(){
    // let sniarray:any=[];
    this.userService.getAllSNIno().pipe(takeUntil(this.destroy$)).subscribe((data:any) => {
  
      console.log('allQuestions',data);
      data.forEach((element: any)=> {
        this.sniarray.push(element.SNIno);
      });
      console.log('sjdfbdljb',this.sniarray);
      
    }); 
  }

  getError() {
    return this.registerForm.get('snino').hasError('required') ? 'This field is required' :
      this.registerForm.get('snino').hasError('alreadyInUse') ? 'This SNI Number is already in use' :'';
  }

  
}