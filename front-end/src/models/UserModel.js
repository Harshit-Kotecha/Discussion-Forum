export const userDataModel = {
    id: null,          
    name: "",          
    email: "",         
    phone: "",      
    isLoggedIn: false,  
    roles: []          
  };
  

 export  class HostFormModel {
    constructor(created_by = "", judgesList = [], channel_name = "") {
      this.created_by = created_by;
      this.judgesList = judgesList;
      this.channel_name = channel_name;
    }
  } 

  