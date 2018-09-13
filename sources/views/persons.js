import {JetView} from "webix-jet";
import {persons} from "models/persons";

export default class PersonsView extends JetView {
	config(){
		const _ = this.app.getService("locale")._;
		const theme = this.app.config.theme;

		return {
			rows:[
				{
					view:"toolbar", css:theme,
					elements:[
						{ view:"label", label:_("Persons"), localId:"label" },
						{
							view:"text", localId:"search", hidden:true,
							on:{
								onBlur(){
									webix.delay(() => this.hide());
									this.$scope.$$("label").show();
								},
								onTimedKeyPress(){
									const input = this.getValue().toLowerCase();
									this.$scope.$$("list").filter(obj => {
										const name = obj.fname + " " + obj.lname;
										return name.toLowerCase().indexOf(input) !== -1;
									});
								}
							}
						},
						{
							view:"icon", icon:"magnify",
							click:() => {
								this.$$("search").show();
								this.$$("label").hide();
								this.$$("search").focus();
							}
						},
						{ width:0.1 }
					]
				},
				{
					view:"list",
					localId:"list",
					css:"persons_list",
					width:250,
					select:true,
					tooltip:{
						template:_("Click twice to see more goodies")
					},
					type:{
						template:obj => `<image class="userphoto" src="data/photos/${obj.photo}.jpg" />
							<div class="text">
						  		<span class="username">${obj.fname} ${obj.lname}</span>
						  		<span class="money">$${obj.money}</span>
							</div>`,
						height:66
					},
					on:{
						onAfterSelect:id => {
							const person = persons.getItem(id);
							this.app.callEvent("person:select",[person]);
						},
						onItemDblClick:id => {
							if (this.getUrl()[0].page !== "customers")
								this.show("customers?user="+id+"/information");
							else this.show("information");
						}
					}
				}
			]
		};
	}
	init(){
		const _ = this.app.getService("locale")._;
		const list = this.$$("list");
		
		list.parse(persons);

		this.on(this.app,"customer:save",(id,data) => {
			persons.updateItem(id,data);
			webix.message(_("Saved"));
		});

		this.on(this.app,"form:update",(id) => {
			persons.waitData.then(() => {
				const user = list.getSelectedId();
				if (!user){
					list.select(id || 1);
					list.showItem(id || 1);
				}
				else {
					this.app.callEvent("customer:updatedata",[list.getItem(user)]);
				}
			});
		});

		this.on(this.app,"taction:select",record => {
			if (record) {
				const person = persons.find(obj => obj.company === record.id)[0];
				list.select(person.id);
				list.showItem(person.id);
			}
			else
				list.unselect();
		});
	}
}
