const canvas = document.getElementById("myCanvas");
canvas.width = 200;

const ctx = canvas.getContext("2d");
const car = new Car(100, 100, 30, 50);
car.draw(ctx);

animate();

/**
 * requestionAnimationFrame recalls the animate method
 * many times, giving the illusion of 'moving'.
 */
function animate(){
    car.update();
    canvas.height = window.innerHeight;
    car.draw(ctx);
    requestAnimationFrame(animate);
}