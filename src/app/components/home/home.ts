import { Component } from '@angular/core';
import { Header } from "../header/header";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-home',
  imports: [Header],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}