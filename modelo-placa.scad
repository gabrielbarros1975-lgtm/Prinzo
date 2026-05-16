$fn = 96;

// =======================
// PLACA PRINCIPAL
// =======================
module rounded_rect(w,h,r){
    minkowski(){
        square([w-(2*r),h-(2*r)], center=true);
        circle(r=r);
    }
}

difference(){
    linear_extrude(height=3)
    rounded_rect(220,90,8);

    // Furos superiores
    translate([-85,32,0])
    cylinder(h=8,r=2.5,center=true);

    translate([85,32,0])
    cylinder(h=8,r=2.5,center=true);
}

// =======================
// NOME PERSONALIZADO
// =======================
translate([0,28,3])
linear_extrude(height=4)
offset(r=1.5)
text("Maria Laura",
    size=24,
    halign="center",
    valign="center",
    font="Liberation Sans:style=Bold");

// =======================
// LUA DECORATIVA
// =======================
translate([-90,-8,3])
difference(){
    cylinder(h=4,r=16);
    translate([6,0,-1])
    cylinder(h=6,r=16);
}

// =======================
// ESTRELAS
// =======================
module star(size=5){
    polygon(points=[
        [0,size],[size*0.25,size*0.25],[size,0],
        [size*0.25,-size*0.25],[0,-size],
        [-size*0.25,-size*0.25],[-size,0],
        [-size*0.25,size*0.25]
    ]);
}

translate([65,-10,3])
linear_extrude(height=3)
star(7);

translate([85,10,3])
linear_extrude(height=3)
star(5);

translate([95,-20,3])
linear_extrude(height=3)
star(4);

// =======================
// FRASE PREMIUM
// =======================
translate([0,-28,3])
linear_extrude(height=2)
text("Decoração Infantil",
    size=10,
    halign="center",
    valign="center",
    font="Liberation Sans:style=Regular");
