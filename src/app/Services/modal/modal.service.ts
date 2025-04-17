import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ModalConfig } from '../../Models/Shared/models';
import { ModalAttributes } from '../../utils/app.const';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private configs: ModalConfig = {
    componentRef: null as any,
    attributes: ModalAttributes,
    inputs: {},
  };

  public onCloseModalSubject = new BehaviorSubject<boolean>(false);
  public onCloseModal$ = this.onCloseModalSubject.asObservable();

  private modalConfig = new BehaviorSubject<ModalConfig>(
    this.configs
  );
  public modalConfig$ = this.modalConfig.asObservable();

  setModalConfigs(configs: ModalConfig) {
    if (configs.componentRef) {
      this.modalConfig.next(configs);
      this.configs = configs;
    }
  }

  getModalConfigs = () => this.configs;

  closeModal = () => {
    this.modalConfig.next({
      componentRef: null as any,
      attributes: {},
      isClose: true,
    });
  }
    
}
