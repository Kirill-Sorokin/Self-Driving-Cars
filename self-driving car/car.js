class Car{
    constructor(x,y,width,height,controlType, maxSpeed = 3){
        this.x=x;
        this.y=y;
        this.width=width;
        this.height=height;

        this.speed=0;
        this.acceleration=0.2;
        this.maxSpeed= maxSpeed;
        this.friction=0.05;
        this.angle=0;
        this.damaged = false;

        this.useBrain = controlType == "AI";

        if(controlType != "DUMMY"){
            this.sensor = new Sensor(this);
            this.brain = new NeuralNetwork(
                [this.sensor.rayCount, 6, 4]
            );// 6-hidden layer, 4-output layer; forward, left, right, backward.
        }
        this.controls=new Controls(controlType);
    }

    update(roadBorders, traffic){
        if(!this.damaged){
            this.#move();
            this.polygon = this.#createPolygon();
            this.damaged = this.#assessDamage(roadBorders, traffic);
        }
        if(this.sensor){
            this.sensor.update(roadBorders, traffic);
            const offsets = this.sensor.readings.map(
                s=>s==null?0:1-s.offset
            );
            const outputs = NeuralNetwork.feedForward(offsets, this.brain);
            console.log(outputs);
            if(this.useBrain){
                this.controls.forward = outputs[0];
                this.controls.left = outputs[1];
                this.controls.right = outputs[2];
                this.controls.reverse = outputs[3];   
            }
        }
        // this.sensor.update(roadBorders);
    }

    #assessDamage(roadBorders, traffic){
        for(let j = 0; j < roadBorders.length; j++){
            if(polysIntersect(this.polygon, roadBorders[j])){
                return true;
            }
        }
        for(let j = 0; j < traffic.length; j++){
            if(polysIntersect(this.polygon, traffic[j].polygon)){
                return true;
            }
        }
        return false;
    }

    // Creates (shape of) car
    #createPolygon(){
        const points = [];
        const rad = Math.hypot(this.width, 
            this.height) / 2;
        const alpha = Math.atan2(this.width, this.height);
        points.push({
            x:this.x - Math.sin(this.angle - alpha) * rad,
            y:this.y - Math.cos(this.angle - alpha) * rad
        });
        points.push({
            x:this.x - Math.sin(this.angle + alpha) * rad,
            y:this.y - Math.cos(this.angle + alpha) * rad
        });
        points.push({
            x:this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
            y:this.y - Math.cos(Math.PI + this.angle - alpha) * rad
        });
        points.push({
            x:this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
            y:this.y - Math.cos(Math.PI + this.angle + alpha) * rad
        });
        return points
    }

    #move(){
        if(this.controls.forward){
            this.speed+=this.acceleration;
        }
        if(this.controls.reverse){
            this.speed-=this.acceleration;
        }

        if(this.speed>this.maxSpeed){
            this.speed=this.maxSpeed;
        }
        if(this.speed<-this.maxSpeed/2){
            this.speed=-this.maxSpeed/2;
        }

        if(this.speed>0){
            this.speed-=this.friction;
        }
        if(this.speed<0){
            this.speed+=this.friction;
        }
        if(Math.abs(this.speed)<this.friction){
            this.speed=0;
        }

        if(this.speed!=0){
            const flip=this.speed>0?1:-1;
            if(this.controls.right){
                this.angle-=0.03*flip;
            }
            if(this.controls.left){
                this.angle+=0.03*flip;
            }
        }

        this.x-=Math.sin(this.angle)*this.speed;
        this.y-=Math.cos(this.angle)*this.speed;
    }

    draw(ctx, color, drawSensor = false){
        if(this.damaged){
            ctx.fillStyle = "red";
        } else{
            ctx.fillStyle = color;
        }
        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        for(let j = 1; j < this.polygon.length; j++){
            ctx.lineTo(this.polygon[j].x, this.polygon[j].y);
        }
        ctx.fill();
        if(this.sensor && drawSensor){
            this.sensor.draw(ctx);
        }
        // this.sensor.draw(ctx);
    }
}