import {IInputs, IOutputs} from "./generated/ManifestTypes";

export class AutoCompleteGoogle implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	/**
	 * Empty constructor.
	 */

	private notifyOutputChanged: () => void;
    private searchBox: HTMLInputElement;

    private autocomplete: google.maps.places.Autocomplete;
    private value: string;
    private street: string;
    private city: string;
    private county: string;
    private state: string;
    private zipcode: string;
    private country: string;
    private countrycode: string;
	private stateabb: string;
	private latitude: number;
	private longitude: number;
    //private googleapikey: string;
   


	constructor()
	{

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{
        let environmentvariable = context.parameters.environmentvariableforgooglekey.raw;
        let query = "?$select=schemaname,defaultvalue&$filter=schemaname eq '"+environmentvariable+"'"; 
        let googleapikey = "";

        context.webAPI.retrieveMultipleRecords("environmentvariabledefinition", query).then(
            function success(result){
                for(var i= 0; i < result.entities.length; i++){
                    if (result.entities[i]["schemaname"] === environmentvariable){
                        googleapikey = result.entities[i]["defaultvalue"];
                    }
                }
            }
            )
       
       
        if (typeof (googleapikey) === "undefined" ||
            typeof (googleapikey) === "undefined") {
            container.innerHTML = "Please provide a valid google api key";
            return;
        }

        this.notifyOutputChanged = notifyOutputChanged;

        this.searchBox = document.createElement("input");
        //this.searchBox.setAttribute("id", "searchBox");
        this.searchBox.className = "addressAutocomplete";
        this.searchBox.addEventListener("mouseenter", this.onMouseEnter.bind(this));
        this.searchBox.addEventListener("mouseleave", this.onMouseLeave.bind(this));

        container.appendChild(this.searchBox);

        //let googleApiKey = context.parameters.googleapikey.raw;
        let scriptUrl = "https://maps.googleapis.com/maps/api/js?libraries=places&language=en&key=" + googleapikey;

        let scriptNode = document.createElement("script");
        scriptNode.setAttribute("type", "text/javascript");
        scriptNode.setAttribute("src", scriptUrl);
        document.head.appendChild(scriptNode);

        window.setTimeout(() => {
            this.autocomplete = new google.maps.places.Autocomplete(
                this.searchBox, { types: ['geocode'] });

            // When the user selects an address from the drop-down, populate the
            // address fields in the form.
            this.autocomplete.addListener('place_changed', () => {
                let place = this.autocomplete.getPlace();
                if (place == null || place.address_components == null) {
                    return;
                }

                this.value = "";
                this.street = "";
                this.city = "";
                this.county = "";
                this.state = "";
                this.country = "";
                this.zipcode = "";
                this.countrycode = "";
				this.stateabb = "";
				let addressGeometry = place.geometry;
                if(addressGeometry != undefined){
                
                    this.latitude = addressGeometry.location.lat();
					this.longitude = addressGeometry.location.lng();
                }

                let streetNumber = "";

                for (var i = 0; i < place.address_components.length; i++) {
                    let addressComponent = place.address_components[i];
                    let componentType = addressComponent.types[0];
                    let addressPiece = addressComponent.long_name;
                    let addressPieceShort = addressComponent.short_name;
                    
                    switch (componentType) {
                        case "street_number":
                            streetNumber = addressPiece + " ";
                            break;
                        case "route":
                            this.street = streetNumber + addressPiece;
                            break;
                        case "locality":
                        case "postal_town":
                            this.city = addressPiece;
                            break;
                        case "administrative_area_level_2":
                            this.county = addressPiece;
                            break;
                        case "administrative_area_level_1":
                            this.state = addressPiece;
                            this.stateabb = addressPieceShort;
                            break;
                        case "country":
                            this.country = addressPiece;
                            this.countrycode = addressPieceShort;
                            break;
                        case "postal_code":
                            this.zipcode = addressPiece;
                            break;
                    }

                }

                this.value = place.formatted_address || "";
                this.notifyOutputChanged();
            });
        },
            1000);
	}
    private onMouseEnter(): void {
        this.searchBox.className = "addressAutocompleteFocused";
    }

    private onMouseLeave(): void {
        this.searchBox.className = "addressAutocomplete";
    }
	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		// Add code to update control view
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {            
			value: this.value,
            street: this.street,
            city: this.city,
            county: this.county,
            state: this.state,
            country: this.country,
            zipcode: this.zipcode,
            countrycode: this.countrycode,
			stateabb: this.stateabb,
			latitude: this.latitude,
			longitude: this.longitude
		};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		// Add code to cleanup control if necessary
	}
}